# IMMA

![Rilakkuma message](readme_img1.PNG) ![Shia message](readme_img2.PNG)

* `docs/` contains code for [IMMA's website](https://wflms20110333.github.io/IMMA/)
* `extension/` contains code for the chrome extension (client)
* `server/` contains code for the Flask server
* `server/model/` contains code for the backend Python functions
* `server/requirements.txt` contains list of dependencies (is kept updated by running `pip freeze > server/requirements.txt`)

## Activating the environment

1) Create a new venv if you don't have one yet; activate with `venv_windows_train\Scripts\activate.bat` or equivalent command

2) Update your virtual environment by running `pip install -f server/requirements.txt` or equivalent within the active environment

## Running the server

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

### Deploying the server

The server is located at <http://ec2-52-34-168-73.us-west-2.compute.amazonaws.com/>.

SSH into the EC2 instance with

```shell
ssh -i IMMA.pem ubuntu@ec2-52-34-168-73.us-west-2.compute.amazonaws.com
```

The server has been containerized with docker. After changing directories to `server/`,
build the docker file after any changes with

```shell
docker build -t imma:latest .
```

And launch a container with

```shell
docker run -d -p 80:5000 --name imma-server imma
```

* To list all containers: `docker ps -a`
* To stop all containers: `docker stop $(docker ps -aq)`
* To remove all containers: `docker rm $(docker ps -aq)`
* To ssh into a running container: `docker exec -it CONTAINER_NAME /bin/bash`

To exit the SSH session, type `logout`.

### Outdated instructions for Apache Server

The app is located at `/var/www/html/flaskapp`, the error logs are at `/etc/httpd/logs/error_log` (you will need `sudo` permission to read this), and the WSGI config file is at `/etc/httpd/conf.d/vhost.conf`.

* To start the server, run `sudo service httpd start`.
* To restart the server, run `sudo service httpd restart`.
* To stop the server, run `sudo service httpd stop`.

## Summary of extension structure

### Code files

There are four main code files: `extension/background.js`, `extension/util.js`, `server/app.py`, and `server/model/placeholder.py`.

`background.js` describes what the extension does at a higher level, i.e. what it should do at initialization and how it should respond to events. It calls functions in `util.js`.

`util.js` contains the functions for the extension to send notifications, retrieve information from the server, etc.

`app.py` manages server requests, passing on POST json data to `placeholder.py`.

`placeholder.py` contains functions that the server performs to process data and so on.

### Input files

There are four types of input files; current examples: `MessageBank.txt`, `QuestionBank.txt`, `002_hoshi.imma`, and `001.usersetting`.

`MessageBank.txt` is currently a tab-separated file that contains general messages alongside a score that denotes that message's mood impact on a 5.0 scale [happy, stressed, low-energy, distracted, wellbeing] as well as compatibility with character personality on a 0 to 1 scale [productivity, cheerful, energized].

`QuestionBank.txt` is likewise a tab-separated file containing general questions alongside their scores.

`002_hoshi.imma` and similar are character files that augment the MessageBank/QuestionBank, and contain general information about the character, as well as personality type and any custom messages/questions. (other imma files are not yet updated, just hoshi for now!)

`001.usersetting` and similar are user setting files that contain user preferences and any information about "good" or "bad" browsing sites that the user has provided.

### Items kept in chrome extension memory

```
General variables:
'user_setting': (string) link to setting file for current user
'recent_message_ct': (number) messages sent since last question was sent
'last_tabs': (json) list of the last retrieved tabs, time each opened in ms, e.g. {"calendar.google.com": 1592837352, "app.slack.com": 592835220}
'mood': (array) on 5.0 scale, [happy, stressed, low-energy, distraction, wellbeing]
'last_q_weight': (array) the question-score of the last question given, e.g. [0.5, 0, 0, 0.5, 0]

Imma-specific character variables, updated with loadCharacterCode:
'imma_name': (string) filename of the active character, e.g. '001_ironman'
'image_link': (string) link to image for the active character
'custom_ratio': (number) how often to use custom quotes rather than pull from general database
'textingstyle': (json) describes texting style of the current imma
'message_bank': (json) storage of custom/extra messages for the active character
'question_bank': (json) storage of custom/extra questions for the active character
'question_ratio': (array) ratio of 1 question per X messages
```