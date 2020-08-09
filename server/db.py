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

user_settings_table = Table('user_settings', meta,
                            Column('uid', String),
                            Column('notif_frequency', Integer),
                            Column('notif_fade', Boolean))

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

def insert_user(uid, notif_frequency, notif_fade):
    """ Inserts a user into the user_settings table. """
    insert_statement = user_settings_table.insert().values(uid=uid, 
                                                           notif_frequency=notif_frequency, 
                                                           notif_fade=notif_fade)
    execute_statement(insert_statement)

def select_user(uid):
    """ Returns the row proxy from selecting a row corresponding to a user. """
    select_statement = user_settings_table.select().where(user_settings_table.c.uid == uid)
    return execute_statement(select_statement).first()

def update_notif_frequency(uid, new_notif_frequency):
    """ Updates the notification frequency in seconds for a user. """
    update_statement = user_settings_table.update().where(user_settings_table.c.uid == uid).values(notif_frequency=new_notif_frequency)
    execute_statement(update_statement)

def update_notif_fade(uid, new_notif_fade):
    """ Updates whether or not a user wants notifications to fade. """
    update_statement = user_settings_table.update().where(user_settings_table.c.uid == uid).values(notif_fade=new_notif_fade)
    execute_statement(update_statement)

def delete_user(uid):
    """ Deletes a user from the database. """
    delete_statement = user_settings_table.delete().where(user_settings_table.c.uid == uid)
    execute_statement(delete_statement)

print(redeem_code("ezou", "1234"))
insert_code("ezou", "1234", 2)
print(redeem_code("ezou", "1234"))
print(redeem_code("ezou", "1234"))
