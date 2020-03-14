from app.api import bp
from flask import request,jsonify,url_for
from app.models import Fridge, User
from app import db
from app.api.errors import error_response
from flask_jwt_extended import jwt_required, get_raw_jwt
from sqlalchemy import desc, asc

@bp.route('/fridges', methods=['GET'])
@jwt_required
def get_fridges():
    user = User.fromJwt()

    data = [fridge.to_dict() for fridge in user.fridges]
    return jsonify(data)

@bp.route('/fridges/<string:uuid>', methods=['GET'])
@jwt_required
def get_fridge_by_uuid(uuid):
    fridge = Fridge.query.filter_by(uuid=uuid).first()

    user = User.fromJwt()
    if (user.uuid not in [owner.uuid for owner in fridge.owners]):
        return error_response(401)

    return jsonify(fridge.to_dict()) if fridge else error_response(404)

@bp.route('/fridges', methods=['POST'])
@jwt_required
def create_fridges():
    data = request.get_json() or {}
    fridge = Fridge()
    fridge.from_dict(data, is_new=True)

    user = User.fromJwt()
    fridge.owners.append(user)

    db.session.add(fridge)
    db.session.commit()
    response = jsonify(fridge.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_fridge_by_uuid', uuid=fridge.uuid)
    return response

@bp.route('/fridges/<string:fridge_uuid>/owners', methods=['POST'])
@jwt_required
def add_owners(fridge_uuid):
    data = request.get_json() or {}
    current_user = User.fromJwt()
    fridge = Fridge.query.filter_by(uuid=fridge_uuid).first()

    if (current_user.uuid not in [owner.uuid for owner in fridge.owners]):
        return error_response(401)

    new_user = User.query.filter_by(uuid=data['uuid']).first()

    fridge.owners.append(new_user)
    db.session.commit()
    return jsonify(fridge.to_dict()) if fridge else error_response(404)
