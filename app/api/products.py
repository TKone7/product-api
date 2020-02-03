from app.api import bp
from flask import g
from flask import request
from flask import jsonify
from app.models import Product, QuantityType
from app import db
from app.api.errors import bad_request,error_response
from flask import url_for
from app.api.auth import token_auth

@bp.route('/products', methods=['GET'])
@token_auth.login_required
def get_products():
    page = request.args.get('page',1, type=int)
    per_page = min(request.args.get('per_page',5,type=int), 100)
    data = Product.to_collection_dict(Product.query, page, per_page, 'api.get_products')
    return jsonify(data)

@bp.route('/products/<string:barcode>', methods=['GET'])
@token_auth.login_required
def get_product(barcode):
    result = Product.query.filter_by(barcode=barcode).first()
    return jsonify(result.to_dict()) if result else  error_response(404)

@bp.route('/products', methods=['POST'])
@token_auth.login_required
def create_products():
    data = request.get_json() or {}
    if 'name' not in data or 'barcode' not in data:
        return bad_request('name or barcode is not in the data')
    if 'barcode' in data and Product.query.filter_by(barcode=data['barcode']).first():
        return bad_request('barcode is already existent')
    if 'qty_type' in data and data['qty_type'] not in QuantityType.__members__:
        return bad_request('this QuantityType is invalid')

    product = Product()
    product.from_dict(data,is_new=True)
    product.creator = g.current_user
    db.session.add(product)
    db.session.commit()
    response = jsonify(product.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_product', barcode=product.barcode)
    return response

@bp.route('/products/<string:barcode>', methods=['PUT'])
@token_auth.login_required
def update_products(barcode):
    product = Product.query.filter_by(barcode=barcode).first()
    if not product:
        return error_response(404)

    data = request.get_json() or {}
    if 'qty_type' in data and data['qty_type'] not in QuantityType.__members__:
        return bad_request('this QuantityType is invalid')
    product.from_dict(data)
    db.session.commit()
    return jsonify(product.to_dict())
