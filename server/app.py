import boto3
import db
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import model.placeholder as ph # for the nnetwork models
from PIL import Image
import requests
import threading
import util
import urllib.parse
import requests
from random import choice
from string import ascii_uppercase, digits

import db

app = Flask(__name__) # declare app
cors = CORS(app)

@app.route('/')
def hello_world():
    return jsonify({"result": "Whale, hello there!"})

@app.route('/checkCode', methods=['POST'])
def check_code():
    """ Redeems a code, if it is valid for the given user. """
    inputParams = request.get_json()
    uid = inputParams['user_bbug_id']
    code = inputParams['code']
    num_slots = db.redeem_code(uid, code)
    if num_slots == -1:
        return jsonify({"result": "invalidCode"})
    else:
        return jsonify({"result": "validCode", "number": num_slots})        

@app.route('/addCode', methods=['POST'])
def add_code():
    """ Adds redeemable code for the user. """
    inputParams = request.get_json()
    uid = inputParams['user_bbug_id']
    num_slots = inputParams['num_slots']
    pw = inputParams['pw']
    if pw == "imma_Admin!": # code for debugging so include a password thing
        new_code = ''.join(choice(ascii_uppercase + digits) for _ in range(6)) # generate a random code
        db.insert_code(uid, new_code, num_slots)
        return jsonify({"result": "success", "code": new_code})
    else:
        return jsonify({"result": "Invalid request :("})

@app.route('/getHearts', methods=['POST'])
def get_hearts():
    """ Gets current number of hearts. """
    # TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    return jsonify({"result": 0})

@app.route('/addHeart', methods=['POST'])
def add_heart():
    """ Adds hearts to a character. """
    # TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    return jsonify({"result": 0})

@app.route('/uploadFile', methods=['POST'])
def upload_file():
    """ Uploads a file to S3, given the file and the storage path. """
    print('in upload_file!')
    fileobj = True
    try:
        file_to_upload = request.files['file']
    except Exception as e:
        fileobj = False
        file_data = request.form['file']
        with open('character.bbug', 'w') as f:
            json.dump(file_data, f)
    try:
        path = request.form['path']
        conn = boto3.client('s3')
        bucket_name = "imma-bucket"
        if fileobj: # is an image
            image = Image.open(file_to_upload)
            x, y = util.getNewImageDimensions(image.size)
            new_image = image.resize((x, y))
            new_image.save('character.png', format='PNG') # TODO: not necessarily png?
            with open('character.png', 'rb') as f:
                conn.upload_fileobj(f, bucket_name, path)
        else: # is not an image --> is a .bbug file
            with open('character.bbug', 'rb') as f:
                conn.upload_fileobj(f, bucket_name, path)
        print('upload file success')
        return jsonify({"result": "upload success!"})
    except Exception as e:
        return jsonify({"result": str(e)})

@app.route('/getBbugFile', methods=['GET'])
def get_bbug_file():
    """ Given a user's uid and the character name, returns the .bbug file. """
    uid = request.args.get('uid')
    character_name = request.args.get('character_name')
    if uid == None or character_name == None:
        return jsonify({"result": "Invalid request"})
    ##bbug_link = "https://imma-bucket.s3-us-west-2.amazonaws.com/browserbugs/" + uid + '/' + character_name + ".bbug"
    # TODO: check if uid/character_name combination does not exist in S3
    return render_template("index.html", bbugName=character_name, uid=uid)

@app.route('/removeBug', methods=['POST'])
def remove_bug():
    """ Removes the .bbug file and its corresponding image, if they exist. """
    inputParams = request.get_json()
    uid = inputParams['uid']
    bugname = inputParams['bbugname']

    s3 = boto3.resource("s3")
    bucket_name = "imma-bucket"
    bbug_file = s3.Object(bucket_name, "browserbugs/" + uid + "/" + bugname + ".bbug")
    bbug_file.delete()
    bbug_image = s3.Object(bucket_name, "browserbug_images/" + uid + "/" + bugname + ".png")
    bbug_image.delete()
    return jsonify({"result": "success"})

@app.route('/getListOfUserFiles', methods=['POST'])
def get_bbug_list():
    """ Returns the links for all the .bbug files of a given user. """
    inputParams = request.get_json()
    uid = inputParams['uid']

    s3 = boto3.resource('s3')
    bucket_name = "imma-bucket"
    s3_url = 'https://imma-bucket.s3-us-west-2.amazonaws.com/'
    bucket = s3.Bucket(bucket_name)

    # Key: name, Value: filepath
    bbug_paths = [object_summary.key for object_summary in bucket.objects.filter(Prefix="browserbugs/" + uid + "/")]
    bbug_path_dict = {bbpath.split('/')[-1].split('.')[0] : s3_url + bbpath for bbpath in bbug_paths}
    return jsonify({"result": "success", "characters": bbug_path_dict})

@app.route('/evaluateState', methods=['POST']) # not using address-bar params, so block GET requests
def evaluate_state():
    """ Given a set of current tabs, predict which state [attention, focus, energy, happiness] a user is in
    an example POST: {'current_tabs': ["github", "fb"]} """
    inputParams = request.get_json()
    mood = inputParams['mood']
    lastTabs = inputParams['last_tabs']
    flaggedSites = inputParams['flagged_sites']
    custom_ratio = inputParams['custom_ratio']
    textingstyle = inputParams['textingstyle']
    user_lang = inputParams['user_lang']
    message_bank = inputParams['message_bank']
    # predict mood
    predictedMood = ph.vectorizeInput(lastTabs, flaggedSites)
    currentState = ph.numerize(mood)

    clipMood = currentState # just for output, clips mood without adding any bonuses
    if sum(clipMood) > 14.7 or sum(clipMood) < 0.3:
        clipMood = [3.0, 3.0, 3.0]

    # for calculation, clip state to between 0 and 5
    calcState = [min(max(i,0),5) for i in predictedMood+currentState]

    # reset state if too happy or too sad
    if sum(calcState) > 14.7 or sum(calcState) < 0.3:
        calcState = [3.0, 3.0, 3.0]
        print("state reset")

    # pick a message
    pickedMessage, _ = ph.pickMessage(calcState, message_bank, custom_ratio, textingstyle, user_lang)
    message = {'predictedState': str(clipMood), 'message': pickedMessage}
    return jsonify(message)

@app.route('/getQuestion', methods=['POST'])
def get_question():
    """ Picks a question randomly """
    inputParams = request.get_json()
    personality = inputParams['personality']
    textingstyle = inputParams['textingstyle']
    custom_ratio = inputParams['custom_ratio']
    qBank = inputParams['question_bank']

    if len(qBank) == 0: # question bank empty
        return jsonify({"result": "qbank_empty"})

    # Pick a question
    pickedQuestion, questionWeight = ph.pickQuestion(qBank, custom_ratio, textingstyle, personality)
    message = {'question': pickedQuestion, 'questionWeight': questionWeight, "result": "ok"} # questionWeight is already stringified
    print("Picked question with weight impact", questionWeight)
    return jsonify(message)

@app.route('/getAlarm', methods=['POST'])
def get_alarm():
    """ Return duration til next alarm (in seconds) & type of alarm """
    inputParams = request.get_json()
    question_ratio = inputParams['question_ratio']
    recent_message_ct = inputParams['recent_message_ct']
    alarm_spacing = inputParams['alarm_spacing']

    # Update site file
    mDuration, mType = ph.getNextAlarmStats(question_ratio, recent_message_ct, alarm_spacing)
    return jsonify({'mDuration': mDuration, 'mType': mType})

@app.route('/getMail', methods=['POST'])
def get_mail():
    """ Return duration til next alarm (in seconds) & type of alarm """
    # #TODO have able to check for multiple update messages, not just one
    inputParams = request.get_json()
    lastMail = inputParams['lastMail']

    update = ["001", "Welcome to Browserbug! :)"]
    if lastMail == update[0]:
        return jsonify({'mail': "none"}) # already read that update
    else:
        return jsonify({'mail': update})

@app.route('/retrieveIMMA', methods=['POST'])
def retrieve_imma():
    """ Given an imma code, return an imma file
    An example POST: {'keycode': "aBcImMaCoDe"} """
    # Authenticate the character code, either False or the name of the file #TODO generate unique codes
    inputParams = request.get_json()
    keycode = inputParams['keycode']

    temp_code_dict = {
        'oldurl': 'https://imma-bucket.s3-us-west-2.amazonaws.com/browserbugs/43762ec8a8815b68d93141c31098284d/Browserbee.bbug'
    }
    if keycode == 'default':
        defaultChar = {"information":{"name":"Browserbee","premade":True,"percentCustomQuotes":"0.1","imageS3Path":"https://imma-bucket.s3-us-west-2.amazonaws.com/browserbug_images/null_image.png","uid":"43762ec8a8815b68d93141c31098284d"},"personality":["0.5","1","1"],"textstyle":{"emojis":"0.5","capitalization":"0.5","punctuation":"0.5"},"messageBank":{}}
        return jsonify(defaultChar)
    elif keycode in temp_code_dict.keys():
        codeAuth = temp_code_dict[keycode]
    else:
        codeAuth = False

    # If have a valid code
    if codeAuth != False:
        # retrieve imma file
        r = requests.get(codeAuth, allow_redirects=True)
        immaString = r.content.decode('utf-8')
        immaData = json.loads(immaString) # convert to string 2
        immaData = json.loads(immaData) # convert to dict
        immaData['result'] = True
        return jsonify(immaData)
    else:
        return jsonify({'result': False})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
