from sqlalchemy import and_
from sqlalchemy import create_engine
from sqlalchemy import Table, Column, String, Integer, Boolean, MetaData #, ARRAY
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import exists

username = 'postgres'
password = 'imma-postgres'
endpoint = 'imma-database.cvhxkbafjiir.us-west-2.rds.amazonaws.com'
port = '5432'
db_name = 'imma'

db_string = 'postgres://' + username + ':' + password + '@' + endpoint + ':' + port + '/' + db_name
db = create_engine(db_string)
meta = MetaData(db)

# create a configured "Session" class
Session = sessionmaker(bind=db)
# create a Session
session = Session()

# uid is full-length
users_table = Table('users', meta,
                    Column('uid', String),
                    Column('num_slots', Integer))

# uid is cropped, 10-digit
redeem_codes_table = Table('redeem_codes', meta,
                           Column('uid', String),
                           Column('code', String),
                           Column('num_slots', Integer))

def execute_statement(statement):
    """ Executes an sqlalchemy statement on the database. """
    with db.connect() as conn:
        result = conn.execute(statement)
    return result

def read_table(table):
    """ Helper method to print out all contents of a table. """
    print("reading table")
    select_statement = table.select()
    result_set = execute_statement(select_statement)
    for r in result_set:
        print(r)

def insert_code(uid, code, num_slots):
    """ Inserts a redeem code into the redeem_codes table. """
    if code_exists(uid, code):
        return
    insert_statement = redeem_codes_table.insert().values(uid=uid, code=code, num_slots=num_slots)
    execute_statement(insert_statement)

def redeem_code(uid, code):
    """ Returns the number of slots associated with the code, or -1 if it doesn't exist. """
    if not code_exists(uid, code):
        return -1
    select_statement = redeem_codes_table.select().where(and_(redeem_codes_table.c.uid == uid,
                                                              redeem_codes_table.c.code == code))
    num_slots = execute_statement(select_statement).first().num_slots
    remove_code(uid, code)
    return num_slots

def code_exists(uid, code):
    """ Returns whether or not a given code exists. """
    return session.query(exists().where(and_(redeem_codes_table.c.uid == uid,
                                             redeem_codes_table.c.code == code
                                        ))).scalar()

def remove_code(uid, code):
    delete_statement = redeem_codes_table.delete().where(and_(redeem_codes_table.c.uid == uid,
                                                              redeem_codes_table.c.code == code))
    execute_statement(delete_statement)

def insert_user(uid, num_slots=3):
    """ Inserts a user into the users_table table. """
    insert_statement = users_table.insert().values(uid=uid, 
                                                   num_slots=num_slots)
    execute_statement(insert_statement)

def select_user(uid):
    """ Returns the row proxy from selecting a row corresponding to a user. """
    select_statement = users_table.select().where(users_table.c.uid == uid)
    return execute_statement(select_statement).first()

def add_slots(uid, new_slots):
    """ Adds new slots to a given user, and returns the new number of slots. """
    select_statement = users_table.select().where(users_table.c.uid == uid)
    old_num_slots = execute_statement(select_statement).first().num_slots
    new_num_slots = old_num_slots + new_slots
    update_num_slots(uid, new_num_slots)
    return new_num_slots

def update_num_slots(uid, new_num_slots):
    """ Updates the notification frequency in seconds for a user. """
    update_statement = users_table.update().where(users_table.c.uid == uid).values(num_slots=new_num_slots)
    execute_statement(update_statement)

def delete_user(uid):
    """ Deletes a user from the database. """
    delete_statement = users_table.delete().where(users_table.c.uid == uid)
    execute_statement(delete_statement)
