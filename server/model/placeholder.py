from collections import Counter
from random import choice
from .nn1_code import nnRNN
import numpy as np

messageBank = {"AMAZING!": [0, 0, 1, 1], "Great job": [0, 0, 0, 1], "You can do this!": [0, 1, 1, 1], "Try harder": [1, 1, 0, 0], "Take a break?": [0, 0, 1, 0]} # (one-hot representations corresponding to impact on 4-vector)
questionBank = [("are you paying attention", [1,0,0,0]), ("are you focused", [0,1,0,0]), ("are you energized", [0,0,1,0]), ("are you happy", [0,0,0,1])]

def initializeSiteIndex(pastSites):
    ''' pastSites: the past 300 sites from history '''
    commonSites = [site[0] for site in Counter(pastSites).most_common(30)] # get the 30 most used sites
    siteIndex = dict(zip(commonSites, range(len(commonSites)))) # dictionary mapping URLs to indices
    return siteIndex

def vectorizeInput(siteList, siteIndex):
    vectInput = np.array([[[0 for i in range(30)]]], dtype=np.float32)
    for site in siteList:
        if site in siteIndex:
            vectInput[0][0][siteIndex[site]] = 1
    return vectInput

def initializeNetwork():
    myRNN = nnRNN(input_dim=30, output_dim=4) # Network layer of the 30 most used sites (RNN with 3-step memory), maps to 4-vector of [attention, focus, energy, positivity]
    return myRNN # #todo return only weights

# Reinforced with Question Type 1 at regular intervals: are you focused?
def giveQType1():
    return choice(questionBank)

def pickMessage(state):
    ''' Input is 4-vector of [attention, focus, energy, positivity], output is an action vector that maximizes the state change '''
    # #todo replace with DQN, this is placeholder for now?
    bestScore = (None, None)
    for message in messageBank.keys():
        score = sum([state[i]==messageBank[message][i] for i in range(4)]) # estimated future score
        #print("DEBUGGGG", state, message, score)
        if bestScore[1] == None or score > bestScore[1]:
            bestScore = (message, score)
    return bestScore[0]

if __name__ == '__main__': # for debug
    '''
    siteIndex = None # #todo this should be a user variable and not reloaded each time
    model = None # ditto
    inputParams = {"hist_for_init": ["google.com","fb", "okokok", "fb", "fb", "google.com", "fb"],"current_tabs": ["okokok", "fb"]} # get input
    if siteIndex == None: # initialize siteIndex if doesn't exist
        inputData = inputParams['hist_for_init']
        siteIndex = initializeSiteIndex(inputData)
    if model == None: # initialize model if doesn't exist
        model = initializeNetwork()

    # convert current urls opened into vector, feed into RNN, and choose message
    vectInput = vectorizeInput(inputParams['current_tabs'], siteIndex)
    #print("debug", "vectInput", vectInput, "type", type(vectInput), np.shape(vectInput))
    currentState = model.online_predict(vectInput)
    #print("model outputted index", currentState)
    message = pickMessage(currentState)
    print(message)
    '''
    print("done")

# An example siteIndex (numbers are the one-hot indices)
'''
docs.google.com    : 0
www.facebook.com : 1
github.com    : 2
slack.com    :3
calendar.google.com :4
app.slack.com    :5
piazza.com    :6
etc
'''