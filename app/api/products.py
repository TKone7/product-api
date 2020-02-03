from app.api import bp

from flask import request
from flask import jsonify
from app.models import Product
from app import db
from app.api.errors import bad_request
from flask import url_for
from app.api.auth import token_auth

@bp.route('/products', methods=['GET'])
@token_auth.login_required
def get_products():
    page = request.args.get('page',1, type=int)
    per_page = min(request.args.get('per_page',5,type=int), 100)
    data = Product.to_collection_dict(Product.query, page, per_page, 'api.get_products')
    return jsonify(data)

@bp.route('/products/<int:id>', methods=['GET'])
@token_auth.login_required
def get_product(id):
    return jsonify(Product.query.get_or_404(id).to_dict())

@bp.route('/products', methods=['POST'])
@token_auth.login_required
def create_products():
    data = request.get_json() or {}
    print(data)
    if 'name' not in data:
        return bad_request('name is not in the data')

    product = Product()
    product.from_dict(data)
    if 'creator_id' not in data:
        product.creator_id = 1
    db.session.add(product)
    db.session.commit()
    response = jsonify(product.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_product', id=product.id)
    return response

@bp.route('/products/<int:id>', methods=['PUT'])
@token_auth.login_required
def update_products(id):
    pass
