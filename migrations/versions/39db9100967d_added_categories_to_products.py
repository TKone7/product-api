"""added categories to products

Revision ID: 39db9100967d
Revises: c57761cd6fae
Create Date: 2020-03-05 08:37:07.209857

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '39db9100967d'
down_revision = 'c57761cd6fae'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('category',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=128), nullable=True),
    sa.Column('name', sa.String(length=128), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_category_slug'), 'category', ['slug'], unique=True)
    op.add_column('product', sa.Column('category_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'product', 'category', ['category_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'product', type_='foreignkey')
    op.drop_column('product', 'category_id')
    op.drop_index(op.f('ix_category_slug'), table_name='category')
    op.drop_table('category')
    # ### end Alembic commands ###