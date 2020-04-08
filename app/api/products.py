from app.api import bp
from flask import request,jsonify,url_for
from app.models import Product, User
from app import db
from app.api.errors import error_response
from flask_jwt_extended import jwt_required, get_raw_jwt
import time
from sqlalchemy import desc, asc

@bp.route('/products', methods=['GET'])
# @jwt_required
def get_products():
    # sorting options
    sort_by = request.args.get('sort_by', default = 'name.asc', type = str)
    sort_column, sort_dir = sort_by.split('.')
    sort = asc(sort_column) if sort_dir == "asc" else desc(sort_column)

    # filtering products
    filter = request.args.get('query', default = None, type = str)

    # page = request.args.get('page',1, type=int)
    # per_page = min(request.args.get('per_page',50,type=int), 100)
    # data = Product.to_collection_dict(Product.query, page, per_page, 'api.get_products')
    products = Product.query.order_by(sort).all()
    data = [item.to_dict() for item in products if (not filter or filter.lower() in (str(item.name) + ' ' + str(item.description)).strip().lower())]
    return jsonify(data)

@bp.route('/products/<string:barcode>', methods=['GET'])
# @jwt_required
def get_product_by_barcode(barcode):
    product = Product.query.filter_by(barcode=barcode).first()
    return jsonify(product.to_dict()) if product else error_response(404)

# @bp.route('/products/<int:id>', methods=['GET'])
# @jwt_required
# def get_product(id):
#     return jsonify(Product.query.get_or_404(id).to_dict())

@bp.route('/products', methods=['POST'])
@jwt_required
def create_products():
    data = request.get_json() or {}

    product = Product()
    product.from_dict(data, is_new=True)

    user = User.fromJwt()
    product.creator = user

    print('product', product)
    db.session.add(product)
    db.session.commit()
    response = jsonify(product.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_product_by_barcode', barcode=product.barcode)
    return response

@bp.route('/products/<string:barcode>', methods=['PUT'])
@jwt_required
def update_products(barcode):
    product = Product.query.filter_by(barcode=barcode).first()
    data = request.get_json() or {}
    product.from_dict(data)
    db.session.commit()
    return jsonify(product.to_dict())

@bp.route('/products/<string:barcode>', methods=['DELETE'])
@jwt_required
def delete_products(barcode):
    product = Product.query.filter_by(barcode=barcode).first()
    if len(product.items.all()) != 0:
        return error_response(400, 'product has still linked items. Delete them first')
    db.session.delete(product)
    db.session.commit()
    return '', 204

@bp.route('/dummy/<string:barcode>', methods=['GET'])
def get_dummy(barcode):

    product = Product.query.filter_by(barcode=barcode).first()
    data = {
        'author': 'Fridgy',
        'imageUrl': 'https://goodfoodpittsburgh.com/wp-content/uploads/2020/04/90240620_2746770322276623_5907194348251886208_n-750x420.jpg',
        "linkOutUrl": "https://fridgy-frontend.herokuapp.com/",
        "name": "Product import from Fridgy",
        "tagline": "",
        "yield": "",
        "time": "",
        "nutrition": { },
        "items": [
            {"itemId": product.name}
        ]
        }

    return jsonify(data) if product else error_response(404)
