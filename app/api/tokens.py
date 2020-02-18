from flask import jsonify, g
from app import db
from app.api import bp
from app.api.auth import basic_auth
# from app.api.auth import token_auth
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_refresh_token_required


# @bp.route('/tokens', methods=['POST'])
# @basic_auth.login_required
# def get_token():
#     token = g.current_user.get_token()
#     db.session.commit()
#     return jsonify({'token': token})

@bp.route('/jwt-token', methods=['POST'])
@basic_auth.login_required
def get_jwttoken():
    user_id = g.current_user.id
    access_token = create_access_token(identity=user_id, fresh=True)
    refresh_token = create_refresh_token(identity=user_id)
    return jsonify(token = access_token, refresh_token = refresh_token)

@bp.route('/refresh-token', methods=['POST'])
@jwt_refresh_token_required
def get_refreshtoken():
    id = get_jwt_identity()
    access_token = create_access_token(identity=id, fresh=False)
    return jsonify(token = access_token)

# @bp.route('/tokens', methods=['DELETE'])
# @token_auth.login_required
# def revoke_token():
#     g.current_user.revoke_token()
#     db.session.commit()
#     return '', 204
