from collections import Counter
from random import choice
from .nn1_code import nnRNN
import numpy as np
import random
import json

def getNextAlarmStats(messageCt, userSettingFile):
    """ Returns the duration until next alarm (in seconds) and the type of alarm

    messageCt -- messages given since last question

    userSettingFile -- file containing user preferences for alarm, etc duration/type """

    # Load list of the user's possible sites & their scores
    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # Mean and stdev for duration until next alarm (in seconds)
    nextAlarm = abs(np.random.normal(userData['AlarmSpacing'], userData['AlarmStdev']))

    # Mean and stdev for having 1 question per every X messages
    nextQuestion = abs(np.random.normal(userData['QuestionFreq'], userData['QuestionStdev']))
    if nextQuestion >= int(messageCt):
        nextQuestion = "message"
    else:
        nextQuestion = "question"
    
    return nextAlarm, nextQuestion

def initializeNetwork():
    """ Returns an instance of RNN model """

    myRNN = nnRNN(input_dim=30, output_dim=4) # Network layer of the 30 most used sites (RNN with 3-step memory), maps to 4-vector of [attention, focus, energy, positivity]
    return myRNN

def vectorizeInput(openedSites, userSettingFile):
    """ Creates an array of numbers from a given list of sites

    openedSites -- a set of currently opened tabs e.g. ["calendar.google.com", "translate.google.com"]

    userSettingFile -- a site-scoring file containing stats for each possible site

    Returns an array, e.g.
                        [0 .6 0 0 .3 0 0 0 ... 0 0 0 .5
                        0 .2 0 0 .1 0 0 0 ... 0 0 0 .2
                        0 .3 0 0 .1 0 0 0 ... 0 0 0 .9
                        0 .9 0 0 .1 0 0 0 ... 0 0 0 .7]
    """
    # TODO where to host user setting files?

    # Initialize an array of zeroes
    vectInput = np.zeros((1, 4, 30))

    # Load list of the user's possible sites & their scores
    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # For each opened site, set its entry in vectInput to the relevant score vector
    for openSite in enumerate(openedSites):
        if openSite in userData['sites'].keys():
            scoreVector = userData['sites'][openSite]
            scoreVector = np.array(scoreVector) # convert to nparray # unused [np.float32(i) for i in scoreVector]
            vectInput[0, :, i] = scoreVector # set entry to score vector

    return vectInput

def pickMessage(state, messageBank):
    """ Picks which message will maximize predicted positive state change

    state -- a 4-vector of [attention, focus, energy, positivity]

    messageBank -- a dictionary of messages

    Returns the message (string), and the full character name (string) """

    #TODO replace with DQN, this is placeholder for now?
    #TODO redundant file-reading code in pickQuestion, make a separate function for processing text file
    #TODO add more randomness!

    randomMessage = random.choice(list(messageBank.keys()))
    bestScore = (randomMessage, None) # default to random message

    # Next, going to add the message-input score to the current-state score
    # Want to maximize scores that are all-around high
    # Each part of the score is transformed by (-1/x) to penalize scores close to zero

    for message in messageBank.keys():
        if np.any(state + messageBank[message] <= 0): # don't calculate -1/x since will become very positive
            pass # assume that result with a negative component is not a good result
        else:
            score = sum([  (-1)/(state[i] + messageBank[message][i])  for i in range(4)]) # estimated -1/x future score
            if bestScore[1] == None or score > bestScore[1]:
                bestScore = (message, score)

    return bestScore[0] # return the best message

def pickQuestion(questionBank):
    """ Picks a random question and also gives its corresponding predicted impact

    questionBank -- a dictionary of questions

    Returns the question (string), the question weights (array), and the full character name (string) """
    
    randomQuestion = random.choice(list(questionBank.keys()))
    
    return randomQuestion, questionBank[randomQuestion]

def learnFromQuestion(openedSites, questionScore, userSettingFile, delta=0.01):
    """ Given a question score vector, update each relevant site score by +/- delta

    openedSites -- a set of the last opened tabs e.g. ['calendar.google.com', 'translate.google.com']

    questionScore -- an array, the weights of the last question given

    userSettingFile -- a site-scoring file containing stats for each possible site

    delta -- how much to adjust site scores by """

    #TODO avoid rereading the whole file each time?

    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # For each opened site, change its score vector
    #TODO use chrome memory saving instead of text file?
    for openSite in enumerate(openedSites):
        if openSite in userData['sites'].keys():
            prevScoreVector = userData['sites'][openSite]
            prevScoreVector = np.array(scoreVector) # convert to nparray # unused [np.float32(i) for i in scoreVector]
            scoreVector = np.around(prevScoreVector - (np.array(questionScore) * delta), decimals=4) # subtract question score
            userData['sites'][openSite] = scoreVector

    # Update the file
    with open(userSettingFile, 'w') as f:
        json.dump(userData, f)

    return

if __name__ == '__main__': # testing functions, may need to change .nn1_code import to nn1_code
    print("done")
