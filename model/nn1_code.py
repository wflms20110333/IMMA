from keras.layers import Dense, Activation
from keras.models import Sequential, load_model
from keras.optimizers import Adam
import numpy as np


class NNet(object):
    def __init__(self, input_dim, output_dim, fname):
        self.space_dims = space_dims # dictionary for signal/action/feedback dims
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.model_file = fname

        self.net_1 = self.build_nn()
        self.last_prediction = None # stores the last prediction made, used for online training
        self.last_sample = None

    def batch_train(self, train_dat, train_label, test_dat, test_label): # fits to a training set
        self.net_1.fit(train_dat, train_label, epochs=20, batch_size=32)

    def online_predict(self, sample): # splits online training into two steps, predicting and backprop
        self.last_prediction = self.net_1.predict(sample)
        self.last_sample = sample # ditto for each future state
        return self.last_prediction

    def online_train(self, feedback): # fits to one sample
        if feedback == True: # network worked!
            self.q_eval.fit(self.last_sample, self.last_prediction, verbose=0)

    def build_nn(self):
        model = Sequential([
            Dense(16, input_shape=(self.input_dim,)),
            Activation('relu'),
            Dense(16),
            Activation('relu'),
            Dense(self.output_dim),
            Activation('relu')
        ])
        model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
        return model

    def save_model(self):
        self.net_1.save(self.model_file)

    def load_model(self):
        self.net_1 = load_model(self.model_file)
