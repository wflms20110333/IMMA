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
    """ Predicts offset in mood based on the current open sites

    openedSites -- a set of the last opened tabs e.g. {'calendar.google.com': 10000, 'translate.google.com': 10000}

    userSettingFile -- a site-scoring file containing effect for flagged sites
    """
    # TODO where to host user setting files?

    mood_delta = np.array([0.0, 0.0, 0.0, 0.0, 0.0]) # predicted offset in mood

    # Load list of the user's possible sites & their scores
    with open(userSettingFile, 'r') as f:
        userData = json.load(f)

    # For each opened site, set its entry in vectInput to the relevant score vector
    for i, possibleSite in enumerate(userData['sites'].keys()):
        for openSite in openedSites.keys():
            if possibleSite == openSite:
                scoreVector = userData['sites'][openSite]

                #print("Debug: score vector match in open tabs!", scoreVector)

                timeMultiplier = 1 # the longer a site is opened, the greater the multiplier
                timeTabOpen = int(time.time() * 1000 - openedSites[openSite])
                if timeTabOpen < 10000: # less than 10 seconds
                    timeMultiplier = 0.5
                elif timeTabOpen > 30000: # more than 30 seconds
                    timeMultiplier = 1.1
                elif timeTabOpen > 120000: # more than 120 seconds
                    timeMultiplier = 1.25
                elif timeTabOpen > 240000: # more than 240 seconds
                    timeMultiplier = 1.5

                predictedImpact = timeMultiplier * scoreVector # impact per each site
                mood_delta += predictedImpact
                #print("mood delta is now", mood_delta)

    return mood_delta

def queryTabbedFile(filename, customMessages, customRatio, state=None):
    """ Loads the default questions/messages for immas to send

    filename -- name of file with the default questions/messages
    
    customMessages -- custom messages/questions to also consider, a dictionary of messages to scores

    customRatio -- ratio of custom content to use

    state -- the current mood, irrelevant if for question

    Returns the question/message (string) and the question/message weights (array)

    #TODO placeholder until if we use a database (?) which might be more efficient (?)
    """

    messageBank = {} # messages to choose from

    if random.uniform(0, 1) < customRatio: # use a custom message
        print("custom content! =-=-=-=-=-=-=-=-=-=-=")
        messageBank = customMessages
    else: # use a general message
        print("default content! =-=-=-=-=-=-=-=-=-=-=")
        with open(filename, "r") as f:
            for line in f:
                # Add valid lines to question bank
                stripped_line = line.strip()
                messageName = stripped_line.split('\t')[0] # get string part of score vector
                messageStats = stripped_line.split('\t')[1:]
                debugx = stripped_line.split('\t')
                messageStats = np.array([np.float32(i) for i in messageStats]) # convert to nparray
                messageBank[messageName] = messageStats

    # Pick out the best 5 messages that maximize scores, then pick one randomly of those 5
    randomMessage = random.choice(list(messageBank.keys()))

    if np.all(state == None): # not dependent on mood, so can just pick a random message!
        print("picking a random question! =-=-=-=-=-=-=-=-=-=-=", randomMessage)
        return randomMessage, ','.join([str(p) for p in messageBank[randomMessage][:5]])

    bestFive = [randomMessage for i in range(5)] # default to random message if not rewritten
    bestScores = [-np.inf for i in range(5)]
    
    # Next, going to add the message-input score to the current-state score
    # Want to maximize scores that are all-around high
    # Each part of the score is transformed by (-1/x) to penalize scores close to zero
    
    for message in random.sample(messageBank.keys(), min(20, len(messageBank.keys()))): # Check at most 20 messages
        #print("debug / evaluating potential message", message)
        if np.any(np.array(state) + np.array(messageBank[message])[:5] <= 0): # don't calculate -1/x since will become very positive
            pass # assume that result with a negative component is not a good result
        else:
            score = sum([  (-1)/(state[i] + messageBank[message][i])  for i in range(4)]) # estimated -1/x future score
            score = np.around(score, decimals=4)
            #print("---------score compare", score, "to", bestScores)
            for k, priorScore in enumerate(bestScores): # see if breaks the record with any of the 5 scores
                if score > bestScores[k]:
                    bestScores[k] = score
                    bestFive[k] = message
                    break

    ans = random.choice(bestFive)
    return ans, ','.join([str(p) for p in messageBank[ans][:5]]) # return one from the top five messages

def pickMessage(state, messageBank, customRatio):
    """ Picks which message will maximize predicted positive state change

    state -- a 5-vector of the predicted mood

    messageBank -- a dictionary of messages

    customRatio -- ratio of custom content to use

    Returns the message (string), and the full character name (string) """

    #TODO replace with DQN, this is placeholder for now?
    #TODO redundant file-reading code in pickQuestion, make a separate function for processing text file
    #TODO add more randomness!

    return queryTabbedFile("server/model/character files/MessageBank.txt", messageBank, customRatio, state)

def pickQuestion(questionBank, customRatio):
    """ Picks a random question and also gives its corresponding predicted impact

    questionBank -- a dictionary of questions

    customRatio -- ratio of custom content to use

    Returns the question (string), the question weights (array) """
    
    randomQuestion = random.choice(list(questionBank.keys()))
    
    return queryTabbedFile("server/model/character files/QuestionBank.txt", questionBank, customRatio)

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
