from sqlalchemy import create_engine
from sqlalchemy import Table, Column, String, Integer, Boolean, ARRAY, MetaData

username = 'postgres'
password = 'imma-postgres'
endpoint = 'imma-database.cvhxkbafjiir.us-west-2.rds.amazonaws.com'
port = '5432'
db_name = 'imma'

db_string = 'postgres://' + username + ':' + password + '@' + endpoint + ':' + port + '/' + db_name
db = create_engine(db_string)
meta = MetaData(db)

user_settings_table = Table('user_settings', meta,
                            Column('email', String),
                            Column('notif_frequency', Integer),
                            Column('notif_fade', Boolean))

def execute_statement(statement):
    """ Executes an sqlalchemy statement on the database. """
    with db.connect() as conn:
        result = conn.execute(statement)
    return result

def read_table(table):
    """ Helper method to print out all contents of a table. """
    select_statement = table.select()
    result_set = execute_statement(select_statement)
    for r in result_set:
        print(r)

def insert_user(email, notif_frequency, notif_fade):
    """ Inserts a user into the user_settings table. """
    insert_statement = user_settings_table.insert().values(email=email, 
                                                           notif_frequency=notif_frequency, 
                                                           notif_fade=notif_fade)
    execute_statement(insert_statement)

def select_user(email):
    """ Returns the row proxy from selecting a row corresponding to a user. """
    select_statement = user_settings_table.select().where(user_settings_table.c.email == email)
    return execute_statement(select_statement).first()

def update_notif_frequency(email, new_notif_frequency):
    """ Updates the notification frequency in seconds for a user. """
    update_statement = user_settings_table.update().where(user_settings_table.c.email == email).values(notif_frequency=new_notif_frequency)
    execute_statement(update_statement)

def update_notif_fade(email, new_notif_fade):
    """ Updates whether or not a user wants notifications to fade. """
    update_statement = user_settings_table.update().where(user_settings_table.c.email == email).values(notif_fade=new_notif_fade)
    execute_statement(update_statement)

def delete_user(email):
    """ Deletes a user from the database. """
    delete_statement = user_settings_table.delete().where(user_settings_table.c.email == email)
    execute_statement(delete_statement)
