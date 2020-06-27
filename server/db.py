from sqlalchemy import create_engine  
from sqlalchemy import Table, Column, String, MetaData

username = 'postgres'
password = 'imma-postgres'
endpoint = 'imma-database.cvhxkbafjiir.us-west-2.rds.amazonaws.com'
port = '5432'
db_name = 'imma'

db_string = 'postgres://' + username + ':' + password + '@' + endpoint + ':' + port + '/' + db_name
db = create_engine(db_string)
meta = MetaData(db)

user_table = Table('users', meta,  
                       Column('uid', String),
                       Column('email', String),
                       Column('password', String),
                       Column('name', String))

with db.connect() as conn:
    print('db has connected')
    # Create
    user_table.create()
    insert_statement = user_table.insert().values(uid="12345", email="ezou@mit.edu", password="immayay!", name="Elizabeth Zou")
    conn.execute(insert_statement)

    print('after create')
    # Read
    select_statement = user_table.select()
    result_set = conn.execute(select_statement)
    for r in result_set:
        print(r)

    # Update
    update_statement = user_table.update().where(user_table.c.uid=="12345").values(email = "newemail@mit.edu")
    conn.execute(update_statement)

    print('after update')
    # Read
    select_statement = user_table.select()
    result_set = conn.execute(select_statement)
    for r in result_set:
        print(r)

    # Delete
    delete_statement = user_table.delete().where(user_table.c.name == "Elizabeth Zou")
    conn.execute(delete_statement)

    print('after delete')
    # Read
    select_statement = user_table.select()
    result_set = conn.execute(select_statement)
    for r in result_set:
        print(r)