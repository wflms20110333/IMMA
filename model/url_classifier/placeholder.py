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

# An example messageBank (one-hot representations corresponding to impact on 4-vector)
'''
AMAZING!! [-1, -1, 1, 1]
Great job! [-1, 0, 0, 1]
You can do this! [0, 1, 1, 1]
Try harder [ 1, 1, -1, -1]
Take a break? [-1, 0, 1, 0]
etc
'''

def initializeSiteIndex(pastSites):
    ''' pastSites: the past 300 sites from history '''
	commonSites = get the 30 most used sites
	siteIndex = hash table mapping URLs to indices
    return siteIndex

def initializeNetwork():
    myRNN = RNN() # Network layer of the 30 most used sites (RNN with 3-step memory), maps to 4-vector of [attention, focus, energy, positivity]
    return myRNN weights

def predictNetwork(weights):
    myRNN = RNN(weights)
    return myRNN.predict()

def fitNetwork():
    myRNN = RNN(weights)
    myRNN.fit()

Reinforced with Question Type 1 at regular intervals: are you focused?


Action space:
Input is 4-vector of [attention, focus, energy, positivity]
Output is an action vector that maximizes the state change
