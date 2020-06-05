# IMMA

* `extension/` contains code for the chrome extension (client)
* `server/` contains code for the Flask server
* `model/` contains code for the ML model
* `venv/` contains the files for the virtual environment; as described on [Flask's installation page](https://flask.palletsprojects.com/en/1.1.x/installation/),

> Use a virtual environment to manage the dependencies for your project, both in development and in production.

> What problem does a virtual environment solve? The more Python projects you have, the more likely it is that you need to work with different versions of Python libraries, or even Python itself. Newer versions of libraries for one project can break compatibility in another project.

> Virtual environments are independent groups of Python libraries, one for each project. Packages installed for one project will not affect other projects or the operating system’s packages.

## Running the Server

Before the first time you run the server, make sure the path is set correctly:

```shell
export FLASK_APP=server/app.py
```

After every change, restart the server:

```shell
flask run
```

This will launch the server at `http://127.0.0.1:5000/`.