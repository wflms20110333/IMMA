from tensorflow.keras.layers import Dense, Activation, SimpleRNN
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.optimizers import Adam
import numpy as np


class nnRNN(object):
    def __init__(self, input_dim=30, output_dim=4, fname=None):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.model_file = fname

        self.net_1 = self.build_rnn()
        self.last_sample = None # stores last sample, used for online training

    def batch_train(self, train_dat, train_label, test_dat, test_label): # fits to a training set
        self.net_1.fit(train_dat, train_label, epochs=20, batch_size=32)

    def online_predict(self, sample): # splits online training into two steps, predicting and backprop
        actionIndex = np.argmax(self.net_1.predict(sample))
        self.last_prediction = np.zeros(self.output_dim)
        self.last_prediction[actionIndex] = 1
        self.last_sample = sample # ditto for each future state
        return self.last_prediction

    def online_train(self, feedback): # fits to one sample, where feedback is a more correct mapping for last sample
        self.net_1.fit(self.last_sample, feedback, verbose=0)

    def build_rnn(self):
        model = Sequential([
            SimpleRNN(3),
            Dense(16, input_shape=(self.input_dim,3), activation='relu'),
            Dense(16, activation='relu'),
            Dense(self.output_dim, activation='softmax')
        ])
        model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
        return model

    def save_model(self):
        self.net_1.save(self.model_file)

    def load_model(self):
        self.net_1 = load_model(self.model_file)
