# IMMA

![Rilakkuma message](readme_img1.PNG) ![Shia message](readme_img2.PNG)

* `docs/` contains code for the main website
* `extension/` contains code for the chrome extension (client)
* `server/` contains code for the Flask server; `server/model/` contains code for the ML model
* `full_requirements.txt` contains list of dependencies (is kept updated by running `pip freeze > light_requirements.txt`)

1) Create a new venv if you don't have one yet; activate with `venv_windows_train\Scripts\activate.bat` or equivalent command

2) Update your virtual environment by running `pip install -f full_requirements.txt` or equivalent within the active environment

## Running the Server

Run `python server/app.py` (can use Postman or similar to test requests)

Before the first time you run the server, make sure the path is set correctly:

```shell
export FLASK_APP=server/app.py
```

If debug mode is set to False, after every change, restart the server with

```shell
flask run
```

This will launch the server at `http://127.0.0.1:5000/`.

## Development

Try out different functions by altering content of `chrome.runtime.onInstalled.addListener` in `background.js`
