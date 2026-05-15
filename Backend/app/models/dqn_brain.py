import tensorflow as tf
from tensorflow.keras import layers

def build_dqn(state_shape, action_size):
    model = tf.keras.Sequential([
        layers.Dense(128, activation='relu', input_shape=(state_shape,)),
        layers.Dense(128, activation='relu'),
        layers.Dense(64, activation='relu'),
        layers.Dense(action_size, activation='linear')
    ])
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss='mse')
    return model
