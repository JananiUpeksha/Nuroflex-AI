import tensorflow as tf
from tensorflow.keras import layers

def build_dqn(state_shape, action_size):
    model = tf.keras.Sequential([
        # Input Layer: Receives the 4-Pillar data
        layers.Dense(64, activation='relu', input_shape=(state_shape,)),
        
        # Hidden Layers: Where the "thinking" happens
        layers.Dense(64, activation='relu'),
        layers.Dense(32, activation='relu'),
        
        # Output Layer: One neuron for each possible action (e.g., Quiz, Video, Break)
        layers.Dense(action_size, activation='linear') 
    ])
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss='mse')
    return model