import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import model.placeholder as ph # for the nnetwork models

app = Flask(__name__) # declare app
cors = CORS(app)

@app.route('/')
def hello_world():
    return "Whale, hello there!"

@app.route('/uploadBbug', methods=['POST'])
def upload_image():
    try:
        inputParams = request.get_json()
        print(inputParams)
        user_id = inputParams['user_bbug_id']
        imma_data = inputParams['bbug_data']
        print(user_id)
        conn = boto3.client('s3')
        bucket_name = "imma-bucket"
        conn.upload_fileobj(user_id, imma_data, bucket_name, 'uploaded_file.bbug')
        return "upload success!"
    except Exception as e:
        return str(e)

@app.route('/evaluateState', methods=['POST']) # not using address-bar params, so block GET requests
def evaluate_state():
    """ Given a set of current tabs, predict which state [attention, focus, energy, happiness] a user is in
    an example POST: {'current_tabs': ["github", "fb"]} """
    inputParams = request.get_json()

    # predict mood
    predictedMood = ph.vectorizeInput(inputParams['last_tabs'], inputParams['flagged_sites'])
    currentState = ph.numerize(inputParams['mood'])

    clipMood = currentState # just for output, clips mood without adding any bonuses
    if sum(clipMood) > 14.7 or sum(clipMood) < 0.3:
        clipMood = [3.0, 3.0, 3.0]

    # for calculation, clip state to between 0 and 5
    calcState = [min(max(i,0),5) for i in predictedMood+currentState]

    print("Current mood:", calcState, "from site bonus", predictedMood, "and prior", currentState)

    # reset state if too happy or too sad
    if sum(calcState) > 14.7 or sum(calcState) < 0.3:
        calcState = [3.0, 3.0, 3.0]
        print("state reset")

    # pick a message
    pickedMessage, _ = ph.pickMessage(calcState, inputParams['message_bank'], inputParams['custom_ratio'], inputParams['textingstyle'], inputParams['personality'])
    message = {'predictedState': str(clipMood), 'message': pickedMessage}
    return jsonify(message)

@app.route('/getQuestion', methods=['POST'])
def get_question():
    """ Picks a question randomly """
    inputParams = request.get_json()

    # Pick a question
    pickedQuestion, questionWeight = ph.pickQuestion(inputParams['question_bank'], inputParams['custom_ratio'], inputParams['textingstyle'], inputParams['personality'])
    message = {'question': pickedQuestion, 'questionWeight': questionWeight} # questionWeight is already stringified
    print("Picked question with weight impact", questionWeight)
    return jsonify(message)

@app.route('/getAlarm', methods=['POST'])
def get_alarm():
    """ Return duration til next alarm (in seconds) & type of alarm """
    inputParams = request.get_json()

    # Update site file
    mDuration, mType = ph.getNextAlarmStats(inputParams['question_ratio'], inputParams['recent_message_ct'], inputParams['alarm_spacing'])

    return jsonify({'mDuration': mDuration, 'mType': mType})

@app.route('/getMail', methods=['POST'])
def get_mail():
    """ Return duration til next alarm (in seconds) & type of alarm """
    inputParams = request.get_json()
    # #TODO have able to check for multiple update messages, not just one
    update = ["001", "Hi there! No new mail for now."]
    if inputParams['lastMail'] == update[0]:
        return jsonify({'mail': "none"}) # already read that update
    else:
        return jsonify({'mail': update})

@app.route('/retrieveIMMA', methods=['POST'])
def retrieve_imma():
    """ Given an imma code, return an imma file
    An example POST: {'keycode': "aBcImMaCoDe"} """
    inputParams = request.get_json()

    # Authenticate the character code, either False or the name of the file #TODO generate unique codes
    temp_code_dict = {
        'default': '001_default'
    }
    if inputParams['keycode'] in temp_code_dict.keys():
        codeAuth = temp_code_dict[inputParams['keycode']]
    else:
        codeAuth = False

    # If have a valid code
    if codeAuth != False:
        # retrieve imma file
        with open("server/model/character files/" + codeAuth + ".bbug") as immaFile: #TODO where to store these files?
            immaData = json.load(immaFile)
        immaData['success'] = True
        return jsonify(immaData)
    else:
        return jsonify({'success': False})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
