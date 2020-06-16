from collections import Counter
from random import choice
from .nn1_code import nnRNN
import numpy as np
import random
import json

def initializeNetwork():
    ''' Returns an instance of RNN model '''

    myRNN = nnRNN(input_dim=30, output_dim=4) # Network layer of the 30 most used sites (RNN with 3-step memory), maps to 4-vector of [attention, focus, energy, positivity]
    return myRNN # #todo return only weights

def vectorizeInput(openedSites, userSettingFile = "server/model/001.usersetting"):
    ''' Creates an array of numbers from a given list of sites

    openedSites -- a set of currently opened tabs e.g. ['calendar.google.com', 'translate.google.com']

    userSettingFile -- a site-scoring file containing stats for each possible site

    Returns an array, e.g.
                        [0 .6 0 0 .3 0 0 0 ... 0 0 0 .5
                        0 .2 0 0 .1 0 0 0 ... 0 0 0 .2
                        0 .3 0 0 .1 0 0 0 ... 0 0 0 .9
                        0 .9 0 0 .1 0 0 0 ... 0 0 0 .7]
    '''
    # TODO where to host user setting files?

    # Initialize an array of zeroes
    vectInput = np.zeros((1, 4, 30))

    # Load list of the user's possible sites & their scores for that site into allSites
    #TODO avoid rereading the whole file each time?
    with open(userSettingFile,"r") as f:
        allSites = [line.rstrip() for line in f]

    # For each opened site, set its entry in vectInput to the relevant score vector
    for i, ithSite in enumerate(allSites):
        if ithSite.split('\t')[0] in openedSites:
            scoreVector = ithSite.strip().split('\t')[1:] # get string version of score vector
            scoreVector = np.array([np.float32(i) for i in scoreVector]) # convert to nparray
            vectInput[0, :, i] = scoreVector # set entry to score vector

    return vectInput

def pickMessage(state):
    ''' Picks which message will maximize predicted positive state change

    state -- a 4-vector of [attention, focus, energy, positivity]

    Returns a string '''

    #TODO replace with DQN, this is placeholder for now?
    #TODO avoid rereading the whole file each time?
    #TODO redundant file-reading code in pickQuestion, make a separate function for processing text file

    with open("server/model/001.imma", "r") as json_file: # load bank of messages
        data = json.load(json_file)
        messageBank = data["messageBank"]

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

def pickQuestion():
    ''' Picks a random question and also gives its corresponding predicted impact
    
    Returns a string and an array '''
    #TODO avoid rereading the whole file each time?

    with open("server/model/001.imma", "r") as json_file:
        data = json.load(json_file)
        questionBank = data["questionBank"]

    randomQuestion = random.choice(list(questionBank.keys()))
    
    return (randomQuestion, questionBank[randomQuestion])

def learnFromQuestion(openedSites, questionScore, delta=0.01):
    ''' Given a question score vector like [1 0 0 0]
    Then update site score of each vector by +/- delta, e.g. for delta = 0.3 and negative answer
                       [0 .3 0 0 .0 0 0 0 ... 0 0 0 .2
                        0 .2 0 0 .1 0 0 0 ... 0 0 0 .2
                        0 .3 0 0 .1 0 0 0 ... 0 0 0 .9
                        0 .9 0 0 .1 0 0 0 ... 0 0 0 .7]
    '''
    #TODO avoid rereading the whole file each time?
    with open("server/model/001.usersetting","r") as f:
        allSites = [line.rstrip() for line in f]
    #print("list of", len(allSites), allSites[:5])

    # For each opened site, change its score vector
    #TODO use chrome memory saving instead of text file
    with open("server/model/001.usersetting", "w") as f:
        for i, ithSite in enumerate(allSites):
            if ithSite.split('\t')[0] in openedSites: # write the different score vector
                prevScoreVector = ithSite.strip().split('\t')[1:] # get string version of previous score vector
                prevScoreVector = np.array([np.float32(i) for i in prevScoreVector]) # convert to nparray
                #print(type(prevScoreVector), type(questionScore), type(delta))
                scoreVector = np.around(prevScoreVector - (questionScore * delta), decimals=4) # subtract question score

                f.write(ithSite.split('\t')[0] + '\t' + '\t'.join(str(z) for z in scoreVector) + '\n') # convert back to string

            else:
                f.write(ithSite + '\n')

    return

if __name__ == '__main__': # testing functions, may need to change .nn1_code import to nn1_code
    #print(vectorizeInput(['calendar.google.com', 'translate.google.com']))
    #print(pickQuestion())
    #learnFromQuestion(['calendar.google.com', 'translate.google.com'], np.array([0, 0, 0, -1.0]))
    print("done")
