from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    application = Flask(__name__)
    application.config.from_object(config_class)

    db.init_app(application)
    migrate.init_app(application, db)

    from app.api import bp as api_bp
    application.register_blueprint(api_bp, url_prefix='/api')

    from app.main import bp as main_bp
    application.register_blueprint(main_bp)

    from app.errors import bp as error_bp
    application.register_blueprint(error_bp)

    return application

from app import models
