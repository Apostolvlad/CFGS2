"""новые параметры здоровье и максимальное здоровье

Revision ID: 9d4b0d506ce8
Revises: 7bd32ee1abe9
Create Date: 2020-07-25 16:48:08.697704

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9d4b0d506ce8'
down_revision = '7bd32ee1abe9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('enemies', sa.Column('health', sa.Integer(), nullable=True))
    op.add_column('enemies', sa.Column('maxHealth', sa.Integer(), nullable=True))
    op.add_column('hero', sa.Column('health', sa.Integer(), nullable=True))
    op.add_column('hero', sa.Column('maxHealth', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('hero', 'maxHealth')
    op.drop_column('hero', 'health')
    op.drop_column('enemies', 'maxHealth')
    op.drop_column('enemies', 'health')
    # ### end Alembic commands ###
