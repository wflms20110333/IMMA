# IMMA

![Rilakkuma message](readme_img1.PNG) ![Shia message](readme_img2.PNG)

* `docs/` contains code for the main website
* `extension/` contains code for the chrome extension (client)
* `server/` contains code for the Flask server; `server/model/` contains code for the ML model
* `full_requirements.txt` contains list of dependencies (is kept updated by running `pip freeze > light_requirements.txt`)

## Activating the environment

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

Calling `findCurrentTabs(sendMessage)` retrieves the current tabs that are open and converts that to an array using a site-scoring file. This array is then passed to the server, and an RNN predicts the user's current state. Based on the state, we then choose a message in the .imma file that maximizes the sum, and finally we send that message in a notification.

`sendNewQuestion` contacts server for a random question in the .imma file, then sends that question as a notification.

`updateWithAnswer`, within `chrome.notifications.onButtonClicked.addListener`, listens for the user's response to a question, and updates the site-scoring file by adding or subtracting `delta * question_weight` from each last active site.

### Items kept in chrome extension memory

```
'imma_name': (string) filename of the current active character, e.g. '001_ironman'
'last_tabs': (array) list of the last retrieved tabs, e.g. ['calendar.google.com', 'app.slack.com']
'last_q_weight': (array) the question-score of the last question given, e.g. [0.5, 0, 0, 0.5]
```