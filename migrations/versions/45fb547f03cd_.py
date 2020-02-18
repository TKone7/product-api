"""empty message

Revision ID: 45fb547f03cd
Revises: 70418c9d5ffc
Create Date: 2020-02-18 13:09:22.681684

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '45fb547f03cd'
down_revision = '70418c9d5ffc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('revoked_tokens',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('jti', sa.String(length=120), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('revoked_tokens')
    # ### end Alembic commands ###
