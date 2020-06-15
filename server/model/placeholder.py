from collections import Counter
from random import choice
from .nn1_code import nnRNN
import numpy as np
import random

def initializeNetwork():
    ''' Returns an instance of RNN model '''
    myRNN = nnRNN(input_dim=30, output_dim=4) # Network layer of the 30 most used sites (RNN with 3-step memory), maps to 4-vector of [attention, focus, energy, positivity]
    return myRNN # #todo return only weights

def vectorizeInput(openedSites):
    ''' Given a set of currently opened tabs, use a site-scoring file like 001.usersetting to generate a vector
    An example result  [0 .6 0 0 .3 0 0 0 ... 0 0 0 .5
                        0 .2 0 0 .1 0 0 0 ... 0 0 0 .2
                        0 .3 0 0 .1 0 0 0 ... 0 0 0 .9
                        0 .9 0 0 .1 0 0 0 ... 0 0 0 .7]
    '''
    # Initialize an array of zeroes
    vectInput = np.zeros((1, 4, 30))

    # Load list of the user's possible sites & their scores for that site into allSites
    #TODO avoid rereading the whole file each time?
    with open("001.usersetting","r") as f:
        allSites = [line.rstrip() for line in f]

    # For each opened site, set its entry in vectInput to the relevant score vector
    for i, ithSite in enumerate(allSites):
        if ithSite.split('\t')[0] in openedSites:
            scoreVector = ithSite.strip().split('\t')[1:] # get string version of score vector
            scoreVector = np.array([np.float32(i) for i in scoreVector]) # convert to nparray
            vectInput[0][0][i] = allSites[ithSite[1]] # set entry to score vector

    return vectInput

def pickMessage(state):
    ''' Input is 4-vector of [attention, focus, energy, positivity], output is an action vector that maximizes the state change '''
    #TODO replace with DQN, this is placeholder for now?
    #TODO avoid rereading the whole file each time?
    #TODO redundant file-reading code in pickQuestion, make a separate function for processing text file

    messageBank = []
    readingLine = False
    with open("001.imma", "r") as f:
        for line in f:
            # Control which lines to read
            stripped_line = line.strip()
            if stripped_line == '|messageBank':
                readingLine == True
            elif stripped_line == '|questionBank':
                readingLine == False
                break

            # Add valid lines to question bank
            elif readingLine:
                messageName = stripped_line.split('\t')[0] # get string version of score vector
                messageScore = stripped_line.split('\t')[1:]
                messageScore = np.array([np.float32(i) for i in questionScorer]) # convert to nparray
                messageBank.append((messageName, messageScore))

    bestScore = (None, None)
    for message in messageBank.keys():
        score = sum([state[i]==messageBank[message][i] for i in range(4)]) # estimated future score
        #print("DEBUGGGG", state, message, score)
        if bestScore[1] == None or score > bestScore[1]:
            bestScore = (message, score)
    return bestScore[0]

def pickQuestion():
    ''' Pick a random question, e.g. Are you paying attention?, and return that along with question's score vector'''
    #TODO avoid rereading the whole file each time?

    availableQuestions = []
    readingLine = False
    with open("001.imma", "r") as f:
        for line in f:
            # Control which lines to read
            stripped_line = line.strip()
            if stripped_line == '|questionBank':
                readingLine == True
            elif stripped_line == '|end':
                readingLine == False
                break

            # Add valid lines to question bank
            elif readingLine:
                questionName = stripped_line.split('\t')[0] # get string version of score vector
                questionScorer = stripped_line.split('\t')[1:]
                questionScorer = np.array([np.float32(i) for i in questionScorer]) # convert to nparray
                availableQuestions.append((questionName, questionScorer))
    
    return random.choice(availableQuestions)

def learnFromQuestion(openedSites, questionScore, delta=0.01):
    ''' Given a question score vector like [1 0 0 0]
    Then update site score of each vector by +/- delta, e.g. for delta = 0.3 and negative answer
                       [0 .3 0 0 .0 0 0 0 ... 0 0 0 .2
                        0 .2 0 0 .1 0 0 0 ... 0 0 0 .2
                        0 .3 0 0 .1 0 0 0 ... 0 0 0 .9
                        0 .9 0 0 .1 0 0 0 ... 0 0 0 .7]
    '''
    #TODO avoid rereading the whole file each time?
    with open("001.usersetting","r") as f:
        allSites = [line.rstrip() for line in f]

    # For each opened site, change its score vector
    #TODO use chrome memory saving instead of text file
    with open("001.usersetting", "w") as f:
        for i, ithSite in enumerate(allSites):
            if ithSite.split('\t')[0] in openedSites: # write the different score vector

                prevScoreVector = ithSite.strip().split('\t')[1:] # get string version of previous score vector
                prevScoreVector = np.array([np.float32(i) for i in prevScoreVector]) # convert to nparray
                scoreVector = prevScoreVector - (questionScore * delta) # subtract question score

                f.write(ithSite.split('\t')[0] + '\t'.join(str(z) for z in scoreVector)) # convert back to string

            else:
                f.write(ithSite)

    return

if __name__ == '__main__': # for debug
    print("done")
