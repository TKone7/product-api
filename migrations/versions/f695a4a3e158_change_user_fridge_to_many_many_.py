"""change user-fridge to many-many-relationship

Revision ID: f695a4a3e158
Revises: f42b20980d5a
Create Date: 2020-03-13 23:26:58.240976

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f695a4a3e158'
down_revision = 'f42b20980d5a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('userfridge',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('fridge_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['fridge_id'], ['fridge.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'fridge_id')
    )
    op.drop_constraint('fridge_owner_id_fkey', 'fridge', type_='foreignkey')
    op.drop_column('fridge', 'owner_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('fridge', sa.Column('owner_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('fridge_owner_id_fkey', 'fridge', 'user', ['owner_id'], ['id'])
    op.drop_table('userfridge')
    # ### end Alembic commands ###