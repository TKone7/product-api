from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    products = db.relationship('Product', backref='creator', lazy='dynamic')

    def __repr__(self):
        return '<User {}>'.format(self.username)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True)
    short_description = db.Column(db.String(256))
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Product {}>'.format(self.name)
