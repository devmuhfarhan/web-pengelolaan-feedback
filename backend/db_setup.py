import pymysql

try:
    db = pymysql.connect(host="127.0.0.1", user="root", password="root")
    cursor = db.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS db_pengelolaan_feedback")
    print("Database db_pengelolaan_feedback ensured.")
    db.close()
except Exception as e:
    print(f"Error creating database: {e}")
