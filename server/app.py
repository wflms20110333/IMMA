from keras.models import load_model
from numpy import array as nparray # only need np.array
from flask import Flask, request, jsonify
import model.placeholder as ph
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World! I made some changes :)'

# load the model, and pass in the custom metric function
model = None # load_model('model/imma_dqn.h5')
siteIndex = None

# define a predict function as an endpoint 
@app.route("/old_predict", methods=["POST"]) # not using address-bar params, so block GET requests
def predict():
    ''' an example POST: {"data": [[3, 4.5, 2.6, 0.3]]} '''
    data = {}
    inputParams = request.get_json() # get input
    inputData = nparray(inputParams['data']) # process input
    data["prediction"] = str(model.predict(inputData)) # make prediction
    return jsonify(data) # return prediction in json format

@app.route("/evaluate_state", methods=["POST"]) # not using address-bar params, so block GET requests
def evalState():
    ''' an example POST: {"hist_for_init": ['google.com','fb',...], "current_tabs": ['github']} '''
    inputParams = request.get_json() # get input
    if siteIndex == None: # initialize siteIndex if doesn't exist
        inputData = inputParams['hist_for_init']
        siteIndex = ph.initializeSiteIndex(inputData)
    if model == None: # initialize model if doesn't exist
        model = ph.initializeNetwork()

    # convert current urls opened into vector, feed into RNN, and choose message
    vecInput = ph.vectorizeInput(inputParams['current_tabs'], siteIndex)
    currentState = model.online_predict(vecInput)
    message = pickMessage(currentState)
    return message

@app.route("/give_question", methods=["POST"]) # not using address-bar params, so block GET requests
def giveQuestion():
    #todo pick a question randomly
    # then process feedback: update messageBank or questionBank or train RNN
    pass

app.run(debug=True, host='0.0.0.0') # host='0.0.0.0' enables remote connections?