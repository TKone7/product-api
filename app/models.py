import base64, os
from app import db
from flask import url_for, g, abort
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from enum import Enum

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
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    products = db.relationship('Product', backref='creator', lazy='dynamic')
    token = db.Column(db.String(32), index=True, unique=True)
    token_expiration = db.Column(db.DateTime)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def check_token(token):
        user = User.query.filter_by(token=token).first()
        if user is None or user.token_expiration < datetime.utcnow():
            return None
        return user

    def __repr__(self):
        return '<User {}>'.format(self.username)

class Product(PaginatedAPIMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True)
    description = db.Column(db.String(256))
    barcode = db.Column(db.String(32), index=True, unique=True)
    qty_type = db.Column(db.Enum(QuantityType))
    qty = db.Column(db.Integer)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    nutrientbase = db.Column(db.Enum(NutrientBase))
    energy_kcal = db.Column(db.Integer)
    fat = db.Column(db.Float(precision=2))
    fat_saturated = db.Column(db.Float(precision=2))
    salt = db.Column(db.Float(precision=2))
    protein = db.Column(db.Float(precision=2))
    carbs = db.Column(db.Float(precision=2))
    carbs_suger = db.Column(db.Float(precision=2))
    fiber = db.Column(db.Float(precision=2))
    natrium = db.Column(db.Float(precision=2))

    def __repr__(self):
        return '<Product {}>'.format(self.name)

    def to_dict(self):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'barcode': self.barcode,
            'creator': self.creator.username,
            'qty': self.qty
        }
        nutrient_data = {
            'energy_kcal': self.energy_kcal,
            'fat':self.fat,
            'fat_saturated':self.fat_saturated,
            'salt':self.salt,
            'protein':self.protein,
            'carbs':self.carbs,
            'carbs_suger':self.carbs_suger,
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
        print(data)
        # Checks checks done when new product is submitted
        if is_new:
            if 'name' not in data or 'barcode' not in data:
                abort(400, description='name and barcode are mandatory')
            if 'barcode' in data and Product.query.filter_by(barcode=data['barcode']).first():
                abort(400, description='barcode is already existent')
            self.creator = g.current_user
            self.barcode = data['barcode']

        # General checks
        if 'qty_type' in data and data['qty_type'] not in QuantityType.__members__:
            abort(400, description='this QuantityType is invalid')

        if 'nutrient' in data and 'nutrientbase' in data['nutrient'] and data['nutrient']['nutrientbase'] not in NutrientBase.__members__:
            abort(400, description='this NutrientBase is invalid')

        for field in ['name',
        'description',
        'qty',
        'qty_type']:
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
            'carbs_suger',
            'fiber',
            'natrium']:
                if field in data['nutrient']:
                    setattr(self, field, float(data['nutrient'][field]) if data['nutrient'][field]!='' else None )
