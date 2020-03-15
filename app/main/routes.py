from flask import send_from_directory # render_template
from app.main import bp

@bp.route('/')
@bp.route('/index')
def index():
    print('test the path')
    user = {'username': 'Tobias'}
    return send_from_directory('./main/', 'index.html', mimetype='text/html')

@bp.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory('./main/', path, mimetype='application/javascript')
