4.1 Setup and Execution
The complete source code for the application is available for review. The following instructions detail the steps required to set up the local development environment and run the project.
1.	Clone the repository: git clone https://github.com/siddhantbapna/notes.git
2.	Install Dependencies : pip install Flask
3.	Initialize the database: python -c 'import app; app.init_db()'
4.	Run the application: python app.py

Once running, navigate to http://127.0.0.1:5000 in your web browser to use the application.
File Structure:
/sbnotes
|
|-- app.py
|-- schema.sql
|
|-- /static
|   |-- style.css
|   |-- script.js
|
|-- /templates
|   |-- index.html
|

