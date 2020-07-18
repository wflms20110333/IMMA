from collections import Counter
from random import choice
import numpy as np
import random
import json
import time
import re
import math

def getNextAlarmStats(questionRatio, messageCt, alarmGap):
    """ Returns the duration until next alarm (in seconds) and the type of alarm

    questionRatio -- ratio of 1 question per each x messages

    messageCt -- messages given since last question

    alarmGap -- user's preference for interval between alarms (in seconds) """

    # Mean and stdev for duration until next alarm (in seconds)
    if alarmGap < 120.0:
        nextAlarm = abs(np.random.normal(alarmGap, 2.0)) # stdev of 2.0 seconds
    else:
        nextAlarm = abs(np.random.normal(alarmGap, 10.0)) # stdev of 10.0 seconds

    # Mean (stdev=1) for having 1 question per every X messages
    nextQuestion = abs(np.random.normal(questionRatio, 1))
    if nextQuestion >= int(messageCt):
        nextQuestion = "message"
    else:
        nextQuestion = "question"
    
    return nextAlarm, nextQuestion

def vectorizeInput(openedSites, flaggedSites):
    """ Predicts offset in mood based on the current open sites

    openedSites -- a set of the last opened tabs e.g. {'calendar.google.com': 10000, 'translate.google.com': 10000}

    flaggedSites -- json of site-scoring, containing effect for flagged sites, can be positive or negative
    """
    # TODO where to host user setting files?

    mood_delta = np.array([0.0, 0.0, 0.0]) # predicted offset in mood

    # For each opened site, set its entry in vectInput to the relevant score vector
    for i, possibleSite in enumerate(flaggedSites.keys()):
        for openSite in openedSites.keys():
            if possibleSite == openSite:
                scoreVector = np.array(flaggedSites[openSite])

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

def queryTabbedFile(filename, textstyle, customMessages, customRatio, state=None, personality=None):
    """ Loads the default questions/messages for immas to send, & then picks the message

    filename -- name of file with the default questions/messages

    textstyle -- json of the current imma's texting style
    
    customMessages -- custom messages/questions to also consider, a dictionary of messages to scores

    customRatio -- ratio of custom content to use

    state -- the current mood, irrelevant if for question

    personality -- array of cheer, energy, positivity; necessary for picking default questions

    Returns the question/message (string) and the question/message weights (string i.e. array connected by commas)

    #TODO placeholder until if we use a database (?) which might be more efficient (?)
    """

    messageBank = {} # messages to choose from

    useCustomContent = random.uniform(0, 1) < float(customRatio) and len(customMessages) > 0

    if useCustomContent: # use a custom message
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

    # First, pick a random message/question
    randomMessage = random.choice(list(messageBank.keys()))

    if np.all(state == None): # not dependent on mood (i.e. picking a question), so can just pick a random message!
        print("picking a random question! =-=-=-=-=-=-=-=-=-=-=", randomMessage)
        return stylize_string(randomMessage, textstyle), ','.join([str(p) for p in messageBank[randomMessage][:3]])
    
    # if using preexisting message, cut down message space based on personality
    if not useCustomContent:
        messageBank = personalize(messageBank, personality)
        randomMessage = random.choice(list(messageBank.keys())) # pick new random message within range
    
    # Basically, search for the best 5 messages that maximize scores, then pick one randomly of those 5
    bestFive = [randomMessage for i in range(5)] # default to random message if not rewritten
    bestScores = [-np.inf for i in range(5)]
    
    # Next, going to iterate through each possible message (at most 20 messages)
    # Add the message impact to the current state (happiness, relaxation, determination, focus, wellbeing) (0.0-5.0 scale)
    # Cap at 5. Want to maximize scores that are all-around high
    # Each part of the score is transformed by (-1/x) to penalize scores close to zero
    
    for message in random.sample(messageBank.keys(), min(20, len(messageBank.keys()))): # Check at most 20 messages
        numericVec = np.array(messageBank[message])[:3].astype(np.float)
        if np.any(np.array(state) + numericVec <= 0): # don't calculate -1/x since will become very positive
            pass # assume that result with a negative component is not a good result
        else:
            score = [state[i] + numericVec[i] for i in range(3)] # add predicted amount to state
            score = [min(max(i,0),5) for i in score] # cap at 5
            score = [(-1)/i for i in score] # estimated -1/x future score
            score = sum(score)
            score = np.around(score, decimals=4)
            #print("---------score compare", score, "to", bestScores)
            k = np.argmin(bestScores)
            if score > bestScores[k]: # see if breaks the record with any of the 5 scores
                bestScores[k] = score
                bestFive[k] = message
                break

    ans = random.choice(bestFive)
    ans_stats = ','.join([str(p) for p in messageBank[ans][:3]])
    if not useCustomContent:
        ans = stylize_string(ans, textstyle)
    return ans, ans_stats # return one from the top five messages

def personalize(messages, personality):
    """ Retains 50% of messages that most match personality. Scores are from character personality (-1 to +1) multiplied by message personality (-1 to +1)

    messages -- dictionary of possible messages to scores

    personality -- array of personality [cheer, energy, positivity]"""
    messageScores = []
    for m in messages:
        mScore = [messages[m][i] * float(personality[i]) for i in range(3)] # calculate score for each message
        messageScores.append([m, mScore])
    messageScores.sort(key=lambda x:x[1]) # sort by how good the scores are

    untilIndex = max(1, math.floor(0.5 * (len(messages) - 1))) # find how many messages to keep

    messageKeys = [mess[0] for mess in messageScores[:untilIndex]] # extract the message keys only
    
    return dict([(mess, messages[mess]) for mess in messageKeys])

def stylize_string(msg, textstyle):
    """ Applies a texting style to the message

    msg -- string of the message

    textstyle -- json of the current imma's texting style

    Returns the stylized message (string) """

    msg2 = msg

    # First, extract any emojis
    emoji = ""
    if '[' in msg:
        emoji = re.match(r"[^[]*\[([^]]*)\]", msg2).groups()[0]
        msg2 = re.sub("[\[].*?[\]]", "", msg2)
    
    if textstyle['capitalization'] < 0.3: # don't capitalize
        msg2 = msg2.lower()
    elif textstyle['capitalization'] > 0.8: # extra capitalizing
        msg2 = msg2.upper()

    if textstyle['punctuation'] < 0.3: # don't have punctuation
        msg2 = msg2.replace('!', '').replace('?', '').replace(',', '').replace('.', '')
    elif textstyle['punctuation'] > 0.9: # extra extra punctuation
        msg2 = msg2.replace('!', '!!!!').replace('?', '????')
    elif textstyle['punctuation'] > 0.5: # extra punctuation
        msg2 = msg2.replace('!', '!!').replace('?', '??')
    
    if random.uniform(0, 1) < textstyle['emojis']: # do have emojis
        msg2 = msg2 + emoji

    return msg2

def pickMessage(state, messageBank, customRatio, textstyle, personality):
    """ Picks which message will maximize predicted positive state change

    state -- a 5-vector of the predicted mood

    messageBank -- a dictionary of messages

    customRatio -- ratio of custom content to use

    textstyle -- json of the current imma's texting style

    personality -- json

    Returns the message (string), and the full character name (string)"""

    ans = queryTabbedFile("model/character files/MessageBank.txt", textstyle, messageBank, customRatio, state, personality)
    return ans

def pickQuestion(questionBank, customRatio, textstyle, personality):
    """ Picks a random question and also gives its corresponding predicted impact

    questionBank -- a dictionary of questions

    customRatio -- ratio of custom content to use

    textstyle -- json of the current imma's texting style

    personality -- json

    Returns the question (string), the question weights (array) """
    
    randomQuestion = random.choice(list(questionBank.keys()))
    
    ans = queryTabbedFile("server/model/character files/QuestionBank.txt", textstyle, questionBank, customRatio, personality=personality)
    return ans

def numerize(numStr, expectedLength = 3):
    """ Changes a non-numpy thing to numpy array of floats"""
    if type(numStr) == list:
        return np.array(numStr).astype(float)
    else: # probably a string
        ans = np.fromstring(numStr[1:-1],sep=', ').astype(float)
        if len(ans) == expectedLength:
            return ans
        ans = np.fromstring(numStr[1:-1],sep=' ').astype(float)
        if len(ans) == expectedLength:
            return ans
    raise ValueError

if __name__ == '__main__': # testing functions, may need to change .nn1_code import to nn1_code
    print("done")
