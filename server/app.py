from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
import model.placeholder as ph # for the nnetwork models
from flask_cors import CORS

app = Flask(__name__) # declare app
cors = CORS(app)

@app.route('/helloWorld')
def hello_world():
    return jsonify({'youDidIt': 'Hello, World! I made some changes :)'})

# initialize variable for model
model = ph.initializeNetwork()

@app.route("/evaluateState", methods=["POST"]) # not using address-bar params, so block GET requests
def evaluate_state():
    ''' an example POST: {"current_tabs": ["github", "fb"]} '''
    global model # force to look in module scope not definition scope
    inputParams = request.get_json()

    # convert current urls opened into vector, feed into RNN, and choose message
    vectInput = ph.vectorizeInput(inputParams['current_tabs'])
    currentState = model.online_predict(vectInput)
    message = ph.pickMessage(currentState)
    
    message = {"modelInput": str(vectInput), "predictedState": str(currentState), "message": message}
    return jsonify(message)

@app.route("/getQuestion", methods=["POST"])
def getQuestion():
    ''' Picks a question randomly '''
    pickedQuestion = ph.pickQuestion()
    message = {"question": pickedQuestion[0], "questionWeight": str(pickedQuestion[1])}
    return jsonify(message)

@app.route("/processAnswer", methods=["POST"])
def processAnswer():
    ''' Given the weights of the last question & the user's answer (#TODO), update the site scores of the user
    An example POST: {"current_tabs": ["github", "fb"], "last_question_score": [1,0,0,0]} '''
    inputParams = request.get_json()

    # Update site file
    ph.learnFromQuestion(inputParams['current_tabs'], inputParams['last_question_score'])

    return jsonify({"success": True})

app.run(debug=True) # host='0.0.0.0' enables remote connections?