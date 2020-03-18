"""remove natrium

Revision ID: 2cc284c4271e
Revises: 698a3660ca7c
Create Date: 2020-03-18 19:02:28.122128

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2cc284c4271e'
down_revision = '698a3660ca7c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('product', 'natrium')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('product', sa.Column('natrium', sa.REAL(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
