from collections import Counter
from random import choice
from nn1_code import RNN
messageBank = {"AMAZING!": [0, 0, 1, 1], "Great job": [0, 0, 0, 1], "You can do this!": [0, 1, 1, 1], "Try harder": [1, 1, 0, 0], "Take a break?": [0, 0, 1, 0]} # (one-hot representations corresponding to impact on 4-vector)
questionBank = [("are you paying attention", [1,0,0,0]), ("are you focused", [0,1,0,0]), ("are you energized", [0,0,1,0]), ("are you happy", [0,0,0,1])]

def initializeSiteIndex(pastSites):
    ''' pastSites: the past 300 sites from history '''
	commonSites = [site[0] for site in Counter(pastSites).most_common(30)] # get the 30 most used sites
	siteIndex = dict(zip(commonSites, range(len(commonSites)))) # dictionary mapping URLs to indices
    return siteIndex

def vectorizeInput(siteList, siteIndex):
    vectInput = [0 for i in 30]
    for site in siteList:
        if site in siteIndex:
            vectInput[siteIndex[site]] = 1
    return vectInput

def initializeNetwork():
    myRNN = RNN(input_dim=30, output_dim=4) # Network layer of the 30 most used sites (RNN with 3-step memory), maps to 4-vector of [attention, focus, energy, positivity]
    return myRNN # #todo return only weights

# Reinforced with Question Type 1 at regular intervals: are you focused?
def giveQType1():
    return choice(questionBank)

def pickMessage(state):
    ''' Input is 4-vector of [attention, focus, energy, positivity], output is an action vector that maximizes the state change '''
    # #todo replace with DQN, this is placeholder for now?
    bestScore = (None, None)
    for message in messageBank:
        score = sum(state and message[1]) # estimated future score
        if bestScore[1] == None or score > bestScore[1]:
            bestScore = (message[0], score)
    return bestScore[0]

# An example siteIndex (numbers are the one-hot indices)
'''
docs.google.com	: 0
www.facebook.com : 1
github.com	: 2
slack.com	:3
calendar.google.com :4
app.slack.com	:5
piazza.com	:6
etc
'''