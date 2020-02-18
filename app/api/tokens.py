from flask import jsonify, g
from app import db, jwt
from app.api import bp
from app.api.auth import basic_auth
from app.models import User, RevokedTokenModel
# from app.api.auth import token_auth
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_refresh_token_required, jwt_required, get_raw_jwt


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

@bp.route('/jwt-token', methods=['DELETE'])
@jwt_required
def delete_jwttoken():
    jti = get_raw_jwt()['jti']
    revoked_token = RevokedTokenModel(jti = jti)
    revoked_token.add()
    return '', 204

@bp.route('/refresh-token', methods=['DELETE'])
@jwt_refresh_token_required
def delete_refreshtoken():
    jti = get_raw_jwt()['jti']
    revoked_token = RevokedTokenModel(jti = jti)
    revoked_token.add()
    return '', 204

@jwt.user_claims_loader
def add_name_to_access_token(identity):
    user = User.check_jwt(identity)
    if user:
        return {
            'name': user.username
        }

@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return RevokedTokenModel.is_jti_blacklisted(jti)

# @bp.route('/tokens', methods=['DELETE'])
# @token_auth.login_required
# def revoke_token():
#     g.current_user.revoke_token()
#     db.session.commit()
#     return '', 204
