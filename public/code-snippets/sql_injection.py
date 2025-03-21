# Python example with SQL injection vulnerability
import sqlite3

def get_user(username):
    # SECURITY ISSUE: String concatenation in SQL queries
    # can lead to SQL injection attacks
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Vulnerable code
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    
    return cursor.fetchone()

# Example usage
user_input = "admin' OR '1'='1"  # Malicious input
user = get_user(user_input)
print(user)

