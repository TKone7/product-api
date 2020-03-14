from app.api import bp
from flask import request,jsonify,url_for, abort
from app.models import Fridge, User, Item
from app import db
from app.api.errors import error_response
from flask_jwt_extended import jwt_required, get_raw_jwt
from sqlalchemy import desc, asc
from datetime import datetime, date

@bp.route('/fridges', methods=['GET'])
@jwt_required
def get_fridges():
    user = User.fromJwt()

    data = [fridge.to_dict() for fridge in user.fridges]
    return jsonify(data)

@bp.route('/fridges/<string:uuid>', methods=['GET'])
@jwt_required
def get_fridge_by_uuid(uuid):
    fridge = getFridge(uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    return jsonify(fridge.to_dict()) if fridge else error_response(404)

@bp.route('/fridges', methods=['POST'])
@jwt_required
def create_fridges():
    data = request.get_json() or {}
    fridge = Fridge()
    fridge.from_dict(data, is_new=True)

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
    fridge = getFridge(fridge_uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    new_user = User.query.filter_by(uuid=data['uuid']).first()

    fridge.owners.append(new_user)
    db.session.commit()
    return jsonify(fridge.to_dict()) if fridge else error_response(404)

@bp.route('/fridges/<string:fridge_uuid>/items', methods=['GET'])
@jwt_required
def get_fridge_items(fridge_uuid):
    fridge = getFridge(fridge_uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    items = [item.to_dict() for item in fridge.items]
    return jsonify(items)

@bp.route('/fridges/<string:fridge_uuid>/items/<string:item_uuid>', methods=['GET'])
@jwt_required
def get_fridge_item(fridge_uuid, item_uuid):
    fridge = getFridge(fridge_uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    for item in fridge.items:
        if str(item.uuid) == item_uuid:
            return jsonify(item.to_dict())

    return error_response(404)

@bp.route('/fridges/<string:fridge_uuid>/items/<string:item_uuid>', methods=['PUT'])
@jwt_required
def update_fridge_item(fridge_uuid, item_uuid):
    data = request.get_json() or {}
    fridge = getFridge(fridge_uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    for item in fridge.items:
        if str(item.uuid) == item_uuid:
            item.from_dict(data)
            db.session.commit()
            return jsonify(item.to_dict())

    return error_response(404)

@bp.route('/fridges/<string:fridge_uuid>/items', methods=['POST'])
@jwt_required
def add_item_to_fridge(fridge_uuid):
    data = request.get_json() or {}

    # get fridge reference and check permission (ownership)
    fridge = getFridge(fridge_uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    # create item
    item = Item()
    item.from_dict(data, is_new=True)
    # set reference to fridge
    item.fridge = fridge
    # store to db
    db.session.add(item)
    db.session.commit()

    response = jsonify(item.to_dict())
    response.status_code = 201
    response.headers['Location'] = url_for('api.get_fridge_item', fridge_uuid=fridge.uuid, item_uuid=item.uuid)
    return response

@bp.route('/fridges/<string:fridge_uuid>/items/<string:item_uuid>', methods=['DELETE'])
@jwt_required
def delete_item_from_fridge(fridge_uuid, item_uuid):
    # get fridge reference and check permission (ownership)
    fridge = getFridge(fridge_uuid)
    if not fridge: return error_response(404)

    if not userHasAccess(fridge):
        return error_response(401)

    for item in fridge.items:
        if str(item.uuid) == item_uuid:
            db.session.delete(item)
            db.session.commit()
            return '', 204

    return error_response(404)


def getFridge(uuid):
    fridge = Fridge.query.filter_by(uuid=uuid).first()
    return fridge

def userHasAccess(fridge):
    user = User.fromJwt()
    return user.uuid in [owner.uuid for owner in fridge.owners]
