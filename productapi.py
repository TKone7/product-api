from app import create_app, db
from app.models import User, Product, RevokedTokenModel, Category, Fridge

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Product': Product, 'Revoked': RevokedTokenModel, 'Category': Category, 'Fridge': Fridge}
