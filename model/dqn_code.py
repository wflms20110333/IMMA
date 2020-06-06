from keras.layers import Dense, Activation
from keras.models import Sequential, load_model
from keras.optimizers import Adam
import numpy as np

# Deep Q-learning from tutorial
# #todo Adapting buffer interface to chrome extension

class ReplayBuffer(object):
    def __init__(self, space_dims, mem_size): # action space is discrete
        self.space_dims = space_dims # dimensionality of input
        self.mem_size = mem_size # size of memory banks
        self.mem_cntr = 0 # current index to write to in memory bank
         
        self.state_memory = np.zeros((mem_size, space_dims["signal"]))
        self.new_state_memory = np.zeros((mem_size, space_dims["signal"]))
        self.action_memory = np.zeros((mem_size,), dtype=np.int32)
        self.reward_memory = np.zeros((mem_size, space_dims["feedback"]))
        
    def store_transition(self, state, action, reward, state_):
        index = self.mem_cntr % self.mem_size # where to store
        self.state_memory[index] = state
        self.new_state_memory[index] = state
        self.action_memory[index] = action
        self.reward_memory[index] = reward
        self.mem_cntr += 1 # increment memory counter

    def sample_buffer(self, batch_size):
        max_mem = min(self.mem_cntr, self.mem_size)
        batch = np.random.choice(max_mem, batch_size)

        states = self.state_memory[batch]
        states_ = self.new_state_memory[batch]
        rewards = self.reward_memory[batch]
        actions = self.action_memory[batch]
        
        return states, actions, rewards, states_

class Agent(object):
    def __init__(self, alpha, gamma,
                epsilon_0, epsilon_delta, epsilon_f,  
                space_dims,
                mem_size, batch_size,
                fname):
        ''' alpha: step size. increase for more dramatic changes.
        gamma: weigh future reward. increase to look ahead more.

        probability epsilon, choose random action.
        probability 1-epsilon, choose best action.
        epsilon should decrease over time.

        mem_size: length of memory.
        batch_size: how much to sample from memory. '''

        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon_0
        self.epsilon_delta = epsilon_delta
        self.epsilon_f = epsilon_f
        self.space_dims = space_dims # dictionary for signal/action/feedback dims
        self.mem_size = mem_size
        self.batch_size = batch_size
        self.model_file = fname

        self.memory = ReplayBuffer(space_dims, mem_size)
        self.q_eval = self.build_dqn(32, 32)

    
    def build_dqn(self, fc1_dims, fc2_dims):
        model = Sequential([
            Dense(fc1_dims, input_shape=(self.space_dims["signal"],)),
            Activation('relu'),
            Dense(fc2_dims),
            Activation('relu'),
            Dense(self.space_dims["action"]) # Q values for each action
        ])

        model.compile(optimizer=Adam(lr=self.alpha), loss="mse")

        return model

    def remember(self, state, action, reward, new_state):
        self.memory.store_transition(state, action, reward, new_state)

    def choose_action(self, state):
        if np.random.random() < self.epsilon: # choose random action
            action = np.random.randint(self.space_dims["action"])
        else: # choose best action
            actions = self.q_eval.predict(state[np.newaxis, :])
            action = np.argmax(actions)

        return action

    def learn(self):
        # wait until have reached batch size, then start drawing for learning examples
        if self.memory.mem_cntr < self.batch_size:
            return

        # samples a batch of states, etc from the buffer
        state, action, reward, new_state = self.memory.sample_buffer(self.batch_size)
        
        # makes predictions for those states
        q_current = self.q_eval.predict(state) # for each state, get Q values for each action
        q_future = self.q_eval.predict(new_state) # ditto for each future state
        
        allInd = np.arange(len(q_current)) # used to slice all entries

        reward = reward[:,0] # reward should be scalar anyway so flatten into a vector not array
        q_future_reward = self.alpha * (reward + self.gamma * np.max(q_future, axis=1))
        q_future_reward = (1 - self.alpha) * q_current[allInd, action] + q_future_reward
        q_current[allInd, action] = q_future_reward
        
        _ = self.q_eval.fit(state, q_current, verbose=0) # update Q

        self.epsilon = max(self.epsilon*self.epsilon_delta, self.epsilon_f)
        
    def save_model(self):
        self.q_eval.save(self.model_file)

    def load_model(self):
        self.q_eval = load_model(self.model_file)
