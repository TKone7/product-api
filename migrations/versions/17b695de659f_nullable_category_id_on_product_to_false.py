"""nullable category_id on product to false

Revision ID: 17b695de659f
Revises: 0149a2e7e07a
Create Date: 2020-03-31 11:33:25.373208

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '17b695de659f'
down_revision = '0149a2e7e07a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('product', 'creator_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('product', 'creator_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###
