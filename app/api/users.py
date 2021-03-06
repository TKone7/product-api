from app.api import bp
from flask import request,jsonify,url_for
from app.models import  User
from app import db
from app.api.errors import error_response,bad_request
from flask_jwt_extended import jwt_required, get_raw_jwt
import time

@bp.route('/users', methods=['HEAD'])
def check_user():
    username = request.args.get('username', default = None, type = str)
    email = request.args.get('email', default = None, type = str)

    user_query = User.query
    if username:
        user_query = user_query.filter_by(username=username)
    if email:
        user_query = user_query.filter_by(email=email)
    user = user_query.first()
    status_code = 200 if user else 204

    return '', status_code

@bp.route('/users', methods=['GET'])
@jwt_required
def get_user():
    user = User.fromJwt()
    if not user.isadmin:
        return error_response(401)

    username = request.args.get('username', default = None, type = str)
    email = request.args.get('email', default = None, type = str)

    user_query = User.query
    if username:
        user_query = user_query.filter_by(username=username)
    if email:
        user_query = user_query.filter_by(email=email)
    users = user_query.all()
    data = [user.to_dict() for user in users]
    return jsonify(data)

@bp.route('/users/email/<string:email>', methods=['GET'])
@jwt_required
def get_user_by_email(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return error_response(404)

    data = user.to_dict(public_only = True)
    return jsonify(data)

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

@bp.route('/users/<string:uuid>', methods=['PUT'])
@jwt_required
def update_users(uuid):
    activeuser = User.fromJwt()
    if not activeuser.isadmin:
        return error_response(401)

    user = User.query.filter_by(uuid=uuid).first()

    data = request.get_json() or {}
    user.from_dict(data)

    if user.username == 'admin':
        user.isadmin = True
    db.session.commit()
    return jsonify(user.to_dict())

@bp.route('/users/<string:uuid>', methods=['DELETE'])
@jwt_required
def delete_users(uuid):
    user = User.query.filter_by(uuid=uuid).first()
    if user.username == 'admin':
        return '', 423

    db.session.delete(user)
    db.session.commit()
    return '', 204
