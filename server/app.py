from keras.models import load_model
from numpy import array as nparray # only need np.array
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
cors = CORS(app)

@app.route('/helloWorld')
def hello_world():
    return jsonify({'youDidIt': 'Hello, World! I made some changes :)'})

# following https://towardsdatascience.com/deploying-keras-deep-learning-models-with-flask-5da4181436a2

# load the model, and pass in the custom metric function
model = load_model('model/imma_dqn.h5')

# define a predict function as an endpoint 
@app.route("/predict", methods=["POST"]) # not using address-bar params, so block GET requests
def predict():
    ''' an example POST: {"data": [[3, 4.5, 2.6, 0.3]]} '''
    data = {}
    inputParams = request.get_json() # get input
    inputData = nparray(inputParams['data']) # process input
    data["prediction"] = str(model.predict(inputData)) # make prediction
    return jsonify(data) # return prediction in json format 

app.run(debug=True, host='0.0.0.0') # host='0.0.0.0' enables remote connections?
