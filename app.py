import sqlite3
import random
import string
from flask import Flask, render_template, request, redirect, url_for, g

app = Flask(__name__)
DATABASE = 'database.db'

# --- Database Helper Functions ---

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row  # This allows accessing columns by name
    return g.db

@app.teardown_appcontext
def close_db(exception):
    """Closes the database again at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Initializes the database from the schema file."""
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
    print("Database initialized.")


# --- Application Routes ---

@app.route('/')
def index():
    """Main page to display notes for a given user token."""
    user_token = request.args.get('token')
    notes = []
    if user_token:
        db = get_db()
        cursor = db.execute(
            'SELECT id, content FROM notes WHERE user_token = ? ORDER BY id DESC', (user_token,)
        )
        notes = cursor.fetchall()
    return render_template('index.html', notes=notes, user_token=user_token)

@app.route('/add', methods=['POST'])
def add_note():
    """Adds a new note for the user."""
    content = request.form['content']
    user_token = request.form['user_token']
    if content and user_token:
        db = get_db()
        db.execute(
            'INSERT INTO notes (content, user_token) VALUES (?, ?)', (content, user_token)
        )
        db.commit()
    return redirect(url_for('index', token=user_token))

@app.route('/update/<int:note_id>', methods=['POST'])
def update_note(note_id):
    """Updates an existing note."""
    content = request.form['content']
    user_token = request.form['user_token']
    if content and user_token:
        db = get_db()
        # Security: Ensure the user token matches the note they are trying to update
        db.execute(
            'UPDATE notes SET content = ? WHERE id = ? AND user_token = ?',
            (content, note_id, user_token)
        )
        db.commit()
    return redirect(url_for('index', token=user_token))

@app.route('/delete/<int:note_id>', methods=['POST'])
def delete_note(note_id):
    """Deletes a note."""
    user_token = request.form['user_token']
    if user_token:
        db = get_db()
        # Security: Ensure the user token matches the note they are trying to delete
        db.execute(
            'DELETE FROM notes WHERE id = ? AND user_token = ?', (note_id, user_token)
        )
        db.commit()
    return redirect(url_for('index', token=user_token))

if __name__ == '__main__':
    app.run(debug=True)