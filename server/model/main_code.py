from dqn_code import Agent
import numpy as np
import matplotlib.pyplot as plt

''' For simulating signals '''
timesteps = 300 # number of timesteps

''' Possible environment states '''
max_signals = 20 # maximum number of categories of possible signals
signal_dim = 4 # a 3D signal (URL type, URL ID, time on URL)
sim_signal = np.random.randint(0, max_signals, (timesteps,signal_dim)) # simulated signal

''' Possible feedback signals '''
max_feedback = 3
feedback_dim = 1 # a 1D signal, DO NOT CHANGE!!! reward function in train assumes scalar
sim_feedback = np.random.randint(0, max_feedback, (timesteps,feedback_dim)) # simulated feedback (random)

''' Possible actions '''
action_dim = 10 # a 3D signal (message type, specific message, message tone)

if __name__ == '__main__':
    agent = Agent(alpha=0.0005, gamma=0.99,
                epsilon_0=1.0, epsilon_delta=0.996, epsilon_f=0.01,
                space_dims = {"signal":signal_dim, "action":action_dim, "feedback":feedback_dim},
                mem_size=1000, batch_size=32,
                fname="model/imma_dqn.h5")
    
    if False: # load model
        agent.load_model()
    else: # train a model
        scores = []
        eps_history = []
        avg_scores = []

        for i in range(len(sim_signal)-1):
            done = False
            score = 0
            observation = sim_signal[i]
            
            action = agent.choose_action(observation)
            observation_ = sim_signal[i+1]
            reward = sim_feedback[i]
            score += reward
            agent.remember(observation, action, reward, observation_)
            observation = observation_
            agent.learn()

            # for plotting
            scores.append(score)
            eps_history.append(agent.epsilon)
            avg_scores.append(np.mean(scores[max(0, i-20):(i+1)]))
            
            if i % 10 == 0 and i > 0:
                print('iteration ', i, 'score %.2f' % score, 'average score $.2f' % avg_scores[-1])
                agent.save_model()

        plt.plot(scores, label="scores")
        plt.plot(eps_history, label="epsilon")
        plt.plot(avg_scores, label="score averages")
        plt.legend()
        plt.savefig("model/no_sync_modeltraining") # graph results kept locally
        #plt.show()
    
print("done")