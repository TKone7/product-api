"""added img url

Revision ID: 866a84fc0e68
Revises: 39db9100967d
Create Date: 2020-03-05 15:23:35.328874

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '866a84fc0e68'
down_revision = '39db9100967d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('product', sa.Column('imgurl', sa.String(length=128), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('product', 'imgurl')
    # ### end Alembic commands ###