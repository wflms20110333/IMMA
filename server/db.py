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
                            Column('notif_fade', Boolean),
                            Column('tracked_sites', ARRAY(String)))

def execute_statement(statement):
    with db.connect() as conn:
        result = conn.execute(statement)
    return result

def read_table(table):
    select_statement = table.select()
    result_set = execute_statement(select_statement)
    for r in result_set:
        print(r)

def insert_user(email, notif_frequency, notif_fade, tracked_sites):
    insert_statement = user_settings_table.insert().values(email=email, 
                                                           notif_frequency=notif_frequency, 
                                                           notif_fade=notif_fade, 
                                                           tracked_sites=tracked_sites)
    execute_statement(insert_statement)

def select_user(email):
    select_statement = user_settings_table.select().where(user_settings_table.c.email == email)
    return execute_statement(select_statement).first()

def get_tracked_sites(email):
    row_proxy = select_user(email)
    return row_proxy["tracked_sites"]

def update_notif_frequency(email, new_notif_frequency):
    update_statement = user_settings_table.update().where(user_settings_table.c.email == email).values(notif_frequency=new_notif_frequency)
    execute_statement(update_statement)

def update_notif_fade(email, new_notif_fade):
    update_statement = user_settings_table.update().where(user_settings_table.c.email == email).values(notif_fade=new_notif_fade)
    execute_statement(update_statement)

def add_tracked_site(email, site_to_add):
    tracked_sites = get_tracked_sites(email)
    if site_to_add not in tracked_sites:
        tracked_sites.append(site_to_add)
        update_statement = user_settings_table.update().where(user_settings_table.c.email == email).values(tracked_sites=tracked_sites)
        execute_statement(update_statement)

def remove_tracked_site(email, site_to_remove):
    tracked_sites = get_tracked_sites(email)
    if site_to_remove in tracked_sites:
        tracked_sites.remove(site_to_remove)
        update_statement = user_settings_table.update().where(user_settings_table.c.email == email).values(tracked_sites=tracked_sites)
        execute_statement(update_statement)

def delete_user(email):
    delete_statement = user_settings_table.delete().where(user_settings_table.c.email == email)
    execute_statement(delete_statement)

# insert_user("ezou@mit.edu", 10, True, [])
read_table(user_settings_table)
add_tracked_site("ezou@mit.edu", "taobao.com")
read_table(user_settings_table)
remove_tracked_site("ezou@mit.edu", "baidu.com")
read_table(user_settings_table)
remove_tracked_site("ezou@mit.edu", "taobao.com")
read_table(user_settings_table)
add_tracked_site("ezou@mit.edu", "github.com")
read_table(user_settings_table)
