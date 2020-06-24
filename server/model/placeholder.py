from collections import Counter
from random import choice
from .nn1_code import nnRNN
import numpy as np
import random
import json
import time

def getNextAlarmStats(questionRatio, messageCt, userSettingFile):
    """ Returns the duration until next alarm (in seconds) and the type of alarm

    questionRatio -- ratio of 1 question per each x messages

    messageCt -- messages given since last question

    userSettingFile -- file containing user preferences for alarm, etc duration/type """

    # Load list of the user's possible sites & their scores
    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # Mean and stdev for duration until next alarm (in seconds)
    nextAlarm = abs(np.random.normal(userData['AlarmSpacing'], userData['AlarmStdev']))

    # Mean (stdev=1) for having 1 question per every X messages
    nextQuestion = abs(np.random.normal(questionRatio, 1))
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

    openedSites -- a set of the last opened tabs e.g. {'calendar.google.com': 10000, 'translate.google.com': 10000}

    userSettingFile -- a site-scoring file containing stats for each possible site

    Returns an array, e.g.
                        [0 .6 0 0 .3 0 0 0 ... 0 0 0 .5
                        0 .2 0 0 .1 0 0 0 ... 0 0 0 .2
                        0 .3 0 0 .1 0 0 0 ... 0 0 0 .9
                        0 .9 0 0 .1 0 0 0 ... 0 0 0 .7]
    """
    # TODO where to host user setting files?

    # Initialize an array of zeroes
    vectInput = np.zeros((1, 6, 30))

    # Load list of the user's possible sites & their scores
    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # For each opened site, set its entry in vectInput to the relevant score vector
    for i, possibleSite in enumerate(userData['sites'].keys()):
        for openSite in openedSites.keys():
            if possibleSite == openSite:
                scoreVector = userData['sites'][openSite]
                timeTabOpen = int(time.time() * 1000 - openedSites[openSite])
                scoreVector.append(timeTabOpen)
                scoreVector = np.array(scoreVector) # convert to nparray # unused [np.float32(i) for i in scoreVector]
                vectInput[0, :, i] = scoreVector # set entry to score vector

    return vectInput

def queryTabbedFile(filename, customMessages):
    """ Loads the default questions/messages for immas to send

    filename -- name of file with the default questions/messages
    
    customMessages -- custom messages/questions to also consider, a dictionary of messages to scores

    Returns the question/message (string) and the question/message weights (array)

    #TODO placeholder until if we use a database (?) which might be more efficient (?)
    """
    availableMessages = []
    with open(filename, "r") as f:
        for line in f:
            # Add valid lines to question bank
            stripped_line = line.strip()
            messageName = stripped_line.split('\t')[0] # get string part of score vector
            messageStats = stripped_line.split('\t')[1:]
            debugx = stripped_line.split('\t')
            messageStats = np.array([np.float32(i) for i in messageStats]) # convert to nparray
            availableMessages.append((messageName, messageStats))
    for customMessage in customMessages.keys():
        availableMessages.append((customMessage, customMessages[customMessage]))

    #TODO implement intelligent message choosing
    ''' randomMessage = random.choice(list(messageBank.keys()))
    bestScore = (randomMessage, None) # default to random message
    
    # Next, going to add the message-input score to the current-state score
    # Want to maximize scores that are all-around high
    # Each part of the score is transformed by (-1/x) to penalize scores close to zero
    for message in messageBank.keys():
        if np.any(np.array(state) + np.array(messageBank[message]) <= 0): # don't calculate -1/x since will become very positive
            pass # assume that result with a negative component is not a good result
        else:
            score = sum([  (-1)/(state[i] + messageBank[message][i])  for i in range(4)]) # estimated -1/x future score
            if bestScore[1] == None or score > bestScore[1]:
                bestScore = (message, score)

    return bestScore[0] # return the best message '''
    
    j = random.choice(availableMessages)
    jnum = list(j[1])
    return j[0], ','.join([str(z) for z in jnum])


def pickMessage(state, messageBank):
    """ Picks which message will maximize predicted positive state change

    state -- a 5-vector of [???? todo]

    messageBank -- a dictionary of messages

    Returns the message (string), and the full character name (string) """

    #TODO replace with DQN, this is placeholder for now?
    #TODO redundant file-reading code in pickQuestion, make a separate function for processing text file
    #TODO add more randomness!

    return queryTabbedFile("server/model/character files/MessageBank.txt", messageBank)

def pickQuestion(questionBank):
    """ Picks a random question and also gives its corresponding predicted impact

    questionBank -- a dictionary of questions

    Returns the question (string), the question weights (array) """
    
    randomQuestion = random.choice(list(questionBank.keys()))
    
    return queryTabbedFile("server/model/character files/QuestionBank.txt", questionBank)

'''
def learnFromQuestion(openedSites, questionScore, userSettingFile, delta=0.01):
    """ Given a question score vector, update each relevant site score by +/- delta

    openedSites -- a set of the last opened tabs e.g. {'calendar.google.com': 10000, 'translate.google.com': 10000}

    questionScore -- an array, the weights of the last question given

    userSettingFile -- a site-scoring file containing stats for each possible site

    delta -- how much to adjust site scores by """

    #TODO avoid rereading the whole file each time?

    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # For each opened site, change its score vector
    #TODO use chrome memory saving instead of text file?
    for openSite in enumerate(openedSites.keys()):
        if openSite in userData['sites'].keys():
            prevScoreVector = userData['sites'][openSite]
            prevScoreVector = np.array(scoreVector) # convert to nparray # unused [np.float32(i) for i in scoreVector]
            scoreVector = np.around(prevScoreVector - (np.array(questionScore) * delta), decimals=4) # subtract question score
            userData['sites'][openSite] = scoreVector

    # Update the file
    with open(userSettingFile, 'w') as f:
        json.dump(userData, f)

    return
'''

if __name__ == '__main__': # testing functions, may need to change .nn1_code import to nn1_code
    print("done")
