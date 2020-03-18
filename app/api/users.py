from app.api import bp
from flask import request,jsonify,url_for
from app.models import  User
from app import db
from app.api.errors import error_response,bad_request
from flask_jwt_extended import jwt_required, get_raw_jwt
import time

@bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    if 'username' not in data or 'email' not in data or 'password' not in data:
        return bad_request('must include username, email and password fields')
    if User.query.filter_by(username=data['username']).first():
        return bad_request('please use a different username')
    if User.query.filter_by(email=data['email']).first():
        return bad_request('please use a different email address')
    user = User()
    user.from_dict(data, new_user=True)
    db.session.add(user)
    db.session.commit()
    response = jsonify(user.to_dict())
    response.status_code = 201
    # response.headers['Location'] = url_for('api.get_user', id=user.id)
    return response
