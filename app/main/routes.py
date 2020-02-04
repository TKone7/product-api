from flask import render_template
from app.main import bp

@bp.route('/')
@bp.route('/index')
def index():
    user = {'username': 'Tobias'}
    return render_template('index.html',user=user)
