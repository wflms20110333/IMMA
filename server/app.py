from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
import model.placeholder as ph # for the nnetwork models
from flask_cors import CORS
import json

app = Flask(__name__) # declare app
cors = CORS(app)

# initialize variable for model
model = ph.initializeNetwork()

@app.route('/')
def hello_world():
    return "Whale, hello there!"

@app.route('/evaluateState', methods=['POST']) # not using address-bar params, so block GET requests
def evaluate_state():
    """ Given a set of current tabs, predict which state [attention, focus, energy, happiness] a user is in
    an example POST: {'current_tabs': ["github", "fb"]} """
    global model # force to look in module scope not definition scope
    inputParams = request.get_json()

    # predict mood
    predictedMood = ph.vectorizeInput(inputParams['last_tabs'], inputParams['user_setting'])
    currentState = inputParams['mood']

    # pick a message
    pickedMessage, _ = ph.pickMessage(predictedMood+currentState, inputParams['message_bank'])
    message = {'modelInput': str(vectInput), 'predictedState': str(currentState), 'message': pickedMessage}
    return jsonify(message)

@app.route('/getQuestion', methods=['POST'])
def get_question():
    """ Picks a question randomly """
    inputParams = request.get_json()

    # Pick a question
    pickedQuestion, questionWeight = ph.pickQuestion(inputParams['question_bank'])
    message = {'question': pickedQuestion, 'questionWeight': questionWeight} # questionWeight is already stringified
    return jsonify(message)

@app.route('/getAlarm', methods=['POST'])
def get_alarm():
    """ Given link to user setting file and messages since last question
    
    Return duration til next alarm (in seconds) & type of alarm """
    inputParams = request.get_json()

    # Update site file
    mDuration, mType = ph.getNextAlarmStats(inputParams['question_ratio'], inputParams['recent_message_ct'], inputParams['user_setting'])

    return jsonify({'mDuration': mDuration, 'mType': mType})

@app.route('/retrieveIMMA', methods=['POST'])
def retrieve_imma():
    """ Given an imma code, return an imma file
    An example POST: {'keycode': "aBcImMaCoDe"} """
    inputParams = request.get_json()

    # Authenticate the character code, either False or the name of the file #TODO generate unique codes
    temp_code_dict = {
        'snapsnapsnap': '001_ironman',
        'horanghae': '002_hoshi',
        'lazybear': '003_rilakkuma',
        'justDOit': '004_shia',
        'waterwater': '005_moana'
    }
    if inputParams['keycode'] in temp_code_dict.keys():
        codeAuth = temp_code_dict[inputParams['keycode']]
    else:
        codeAuth = False

    # If have a valid code
    if codeAuth != False:
        # retrieve imma file
        with open("server/model/character files/" + codeAuth + ".imma") as immaFile: #TODO where to store these files?
            immaData = json.load(immaFile)
        immaData['success'] = True
        return jsonify(immaData)
    else:
        return jsonify({'success': False})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
