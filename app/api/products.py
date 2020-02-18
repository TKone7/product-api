from app.api import bp
from flask import request,jsonify,url_for
from app.models import Product
from app import db
from app.api.errors import error_response
from flask_jwt_extended import jwt_required
# from app.api.auth import token_auth

@bp.route('/products', methods=['GET'])
@jwt_required
def get_products():
    page = request.args.get('page',1, type=int)
    per_page = min(request.args.get('per_page',5,type=int), 100)
    data = Product.to_collection_dict(Product.query, page, per_page, 'api.get_products')
    return jsonify(data)

@bp.route('/products/barcode/<string:barcode>', methods=['GET'])
@jwt_required
def get_product_by_barcode(barcode):
    product = Product.query.filter_by(barcode=barcode).first()
    return jsonify(product.to_dict()) if product else error_response(404)

@bp.route('/products/<int:id>', methods=['GET'])
@jwt_required
def get_product(id):
    return jsonify(Product.query.get_or_404(id).to_dict())

@bp.route('/products', methods=['POST'])
@jwt_required
def create_products():
    data = request.get_json() or {}
    product = Product()
    product.from_dict(data, is_new=True)
    db.session.add(product)
    db.session.commit()
    response = jsonify(product.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_product', id=product.id)
    return response

@bp.route('/products/<int:id>', methods=['PUT'])
@jwt_required
def update_products(id):
    product = Product.query.get_or_404(id)
    data = request.get_json() or {}
    product.from_dict(data)
    db.session.commit()
    return jsonify(product.to_dict())
