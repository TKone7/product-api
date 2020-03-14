import base64, os
from app import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from flask import url_for, g, abort
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date
from enum import Enum
from flask_jwt_extended import get_jwt_identity


class QuantityType(Enum):
    gramm = 1
    milliliter = 2
    pieces = 3

class NutrientBase(Enum):
    hundred_gramm = 1
    hundred_milliliter = 2

class PaginatedAPIMixin(object):
    @staticmethod
    def to_collection_dict(query, page, per_page, endpoint, **kwargs):
        resources = query.paginate(page, per_page, False)
        data = {
            'items': [item.to_dict() for item in resources.items],
            '_meta': {
                'page': page,
                'per_page': per_page,
                'total_pages': resources.pages,
                'total_items': resources.total
            },
            '_links': {
                'self': url_for(endpoint, page=page, per_page=per_page,
                                **kwargs),
                'next': url_for(endpoint, page=page + 1, per_page=per_page,
                                **kwargs) if resources.has_next else None,
                'prev': url_for(endpoint, page=page - 1, per_page=per_page,
                                **kwargs) if resources.has_prev else None
            }
        }
        return data

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(UUID(as_uuid=True), default=uuid.uuid4)

    username = db.Column(db.String(64), index=True, unique=True)
    displayname = db.Column(db.String(120))
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    products = db.relationship('Product', backref='creator', lazy='dynamic')
    fridges = db.relationship('Fridge', secondary='userfridge', backref='owners', lazy='dynamic')

    isadmin = db.Column(db.Boolean)
    # token = db.Column(db.String(32), index=True, unique=True)
    # token_expiration = db.Column(db.DateTime)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def to_dict(self):
        data = {
            'id': self.uuid,
            'username': self.username,
            'displayname': self.displayname,
            'email': self.email,
            'isadmin': self.isadmin,
        }
        return data

    @classmethod
    def fromJwt(cls):
        uuid = get_jwt_identity()
        user =  User.query.filter_by(uuid=uuid).first()
        return user

class RevokedTokenModel(db.Model):
    __tablename__ = 'revoked_tokens'
    id = db.Column(db.Integer, primary_key = True)
    jti = db.Column(db.String(120))

    def add(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def is_jti_blacklisted(cls, jti):
        query = cls.query.filter_by(jti = jti).first()
        return bool(query)

class Product(PaginatedAPIMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(UUID(as_uuid=True), default=uuid.uuid4)

    name = db.Column(db.String(128), index=True)
    description = db.Column(db.String(256))
    barcode = db.Column(db.String(32), index=True, unique=True)
    qty_type = db.Column(db.Enum(QuantityType))
    qty = db.Column(db.Integer)
    imgurl = db.Column(db.String(128))

    # relations
    items = db.relationship('Item', backref='product', lazy='dynamic')
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))

    nutrientbase = db.Column(db.Enum(NutrientBase))
    energy_kcal = db.Column(db.Integer)
    fat = db.Column(db.Float(precision=2))
    fat_saturated = db.Column(db.Float(precision=2))
    salt = db.Column(db.Float(precision=2))
    protein = db.Column(db.Float(precision=2))
    carbs = db.Column(db.Float(precision=2))
    carbs_sugar = db.Column(db.Float(precision=2))
    fiber = db.Column(db.Float(precision=2))
    natrium = db.Column(db.Float(precision=2))

    def __repr__(self):
        return '<Product {}>'.format(self.name)

    def to_dict(self):
        data = {
            'id': self.uuid,
            'name': self.name,
            'description': self.description,
            'barcode': self.barcode,
            'creator': self.creator.username,
            'qty': self.qty,
            'imgurl': self.imgurl,
            'category': self.category.slug if self.category else None
        }
        nutrient_data = {
            'energy_kcal': self.energy_kcal,
            'fat':self.fat,
            'fat_saturated':self.fat_saturated,
            'salt':self.salt,
            'protein':self.protein,
            'carbs':self.carbs,
            'carbs_sugar':self.carbs_sugar,
            'fiber':self.fiber,
            'natrium':self.natrium
        }
        if self.qty_type:
            data['qty_type'] = self.qty_type.name
        if self.nutrientbase:
            nutrient_data['nutrientbase'] = self.nutrientbase.name
            data['nutrient'] = nutrient_data

        return data

    def from_dict(self, data, is_new = False):
        # Checks checks done when new product is submitted
        if is_new:
            if 'name' not in data or 'barcode' not in data:
                abort(400, description='name and barcode are mandatory, receive ' + str(data))
            if 'barcode' in data and Product.query.filter_by(barcode=data['barcode']).first():
                abort(400, description='barcode is already existent')
            self.barcode = data['barcode']

        # General checks
        if 'qty_type' in data and data['qty_type'] not in QuantityType.__members__:
            abort(400, description='this QuantityType is invalid')

        if 'nutrient' in data and 'nutrientbase' in data['nutrient'] and data['nutrient']['nutrientbase'] not in NutrientBase.__members__:
            abort(400, description='this NutrientBase is invalid')

        if 'category' in data:
            self.category = Category.query.filter_by(slug=data['category']).first()

        for field in ['name',
        'description',
        'qty',
        'qty_type',
        'imgurl']:
            if field in data:
                setattr(self, field, data[field])

        if 'nutrient' in data:
            self.nutrientbase = data['nutrient']['nutrientbase']

            for field in [
            'energy_kcal',
            'fat',
            'fat_saturated',
            'salt',
            'protein',
            'carbs',
            'carbs_sugar',
            'fiber',
            'natrium']:
                if field in data['nutrient']:
                    setattr(self, field, float(data['nutrient'][field]) if data['nutrient'][field] else None )
                else:
                    setattr(self, field, None)
        else:
            self.nutrientbase = None
            self.energy_kcal = None
            self.fat = None
            self.fat_saturated = None
            self.salt = None
            self.protein = None
            self.carbs = None
            self.carbs_sugar = None
            self.fiber = None
            self.natrium = None

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    slug = db.Column(db.String(128), index=True, unique=True)
    name = db.Column(db.String(128))
    products = db.relationship('Product', backref='category', lazy='dynamic')

    def __repr__(self):
        return '<Category {}>'.format(self.slug)

    def to_dict(self):
        data = {
            'name': self.name,
            'slug': self.slug
        }
        return data

    def from_dict(self, data):
        pass

class UserFridge(db.Model):
    __tablename__ = 'userfridge'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key = True)
    fridge_id = db.Column(db.Integer, db.ForeignKey('fridge.id'), primary_key = True)

class Fridge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(UUID(as_uuid=True), default=uuid.uuid4)
    name = db.Column(db.String(64))

    # relations
    items = db.relationship('Item', backref='fridge', lazy='dynamic')

    def __repr__(self):
        return '<Fridge {}>'.format(self.uuid)

    def to_dict(self):
        # @todo send resource to user url_for('api.get_user', uuid=user.uuid)
        owners = [owner.username for owner in self.owners]
        data = {
            'id': self.uuid,
            'name': self.name,
            'owner': owners
        }
        return data

    def from_dict(self, data, is_new = False):
        if is_new:
            if 'name' not in data:
                abort(400, description='name is mandatory, receive ' + str(data))
            self.name = data['name']

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(UUID(as_uuid=True), default=uuid.uuid4)
    created = db.Column(db.Date, default=date.today())
    expiry = db.Column(db.Date)

    fridge_id = db.Column(db.Integer, db.ForeignKey('fridge.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))

    qty = db.Column(db.Float(precision=2))

    def __repr__(self):
        return '<Item of {} qty {} in {}>'.format(self.product.name, self.qty, self.fridge.uuid)
