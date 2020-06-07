# IMMA

* `extension/` contains code for the chrome extension (client)
* `server/` contains code for the Flask server
* `model/` contains code for the ML model
* `venv/` contains the files for the virtual environment; as described on [Flask's installation page](https://flask.palletsprojects.com/en/1.1.x/installation/)
* `light_requirements.txt` contains the packages used in `venv_windows/`, a light Windows version of venv; updated by running `pip freeze > light_requirements.txt`. [flask]
* `full_requirements.txt` also includes things such as Keras libraries to train a model. [keras, matplotlib, tensorflow, flask]

1) Activate your environment with `venv_windows\Scripts\activate.bat` or create a new venv if you don't have one yet

2) Update your virtual environment by running `pip install -f light_requirements.txt` or equivalent command within your intended active environment

## Running the Server

Run `python server/app.py` and use Postman or similar to test POST requests with JSON including key "data": [0.0, 1.0, 2.0, 3.0] or similar.

On Mac: before the first time you run the server, make sure the path is set correctly:

```shell
export FLASK_APP=server/app.py
```

If debug mode is set to False, after every change, restart the server with

```shell
flask run
```

This will launch the server at `http://127.0.0.1:5000/`.