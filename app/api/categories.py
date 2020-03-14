from app.api import bp
from flask import request,jsonify,url_for
from app.models import Category
from app import db
from app.api.errors import error_response
from flask_jwt_extended import jwt_required, get_raw_jwt
from sqlalchemy import desc, asc

@bp.route('/categories', methods=['GET'])
@jwt_required
def get_categories():
    sort_by = request.args.get('sort_by', default = 'slug.asc', type = str)
    sort_column, sort_dir = sort_by.split('.')
    sort = asc(sort_column) if sort_dir == "asc" else desc(sort_column)

    query = Category.query.order_by(sort)

    data = [item.to_dict() for item in query.all()]
    return jsonify(data)
