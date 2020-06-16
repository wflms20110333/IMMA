# IMMA

* `docs/` contains code for [IMMA's website](https://wflms20110333.github.io/IMMA/)
* `extension/` contains code for the chrome extension (client)
* `server/` contains code for the Flask server
* `model/` contains code for the ML model
* `light_requirements.txt` contains a light Windows version of venv; updated by running `pip freeze > light_requirements.txt`. [flask]
* `full_requirements.txt` also includes things such as Keras libraries to train a model. [keras, matplotlib, tensorflow, flask]

1) Activate your environment with `venv_windows_train\Scripts\activate.bat` or create a new venv if you don't have one yet

2) Update your virtual environment by running `pip install -f light_requirements.txt` or equivalent command within your intended active environment

## Running the Server

Run `python server/app.py` (can use Postman or similar to test requests)

On Mac: before the first time you run the server, make sure the path is set correctly:

```shell
export FLASK_APP=server/app.py
```

If debug mode is set to False, after every change, restart the server with

```shell
flask run
```

This will launch the server at `http://127.0.0.1:5000/`.
