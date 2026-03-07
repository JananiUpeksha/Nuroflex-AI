import pandas as pd
import numpy as np
import os

class NeuroDataLoader:
    def __init__(self):
        self.usa_files = ['44732737_skill_builder_data.csv', '44736253_skill_builder_data.csv']
        self.asia_user_file = 'Info_UserData.csv'

    def load_usa_tribe(self, nrows=5000):
        print("🇺🇸 Processing USA Tribe (ASSISTments)...")
        data = []
        for f in self.usa_files:
            if os.path.exists(f):
                df = pd.read_csv(f, low_memory=False, nrows=nrows)
                # Speed: Faster response = higher score
                df['speed'] = 1 - (df['ms_first_response'] / 60000).clip(0, 1)
                # Stress: More hints = higher stress (Cognitive Load)
                df['stress'] = (df['hint_count'] / 5).clip(0, 1)
                
                for _, row in df.iterrows():
                    # Vector: [Mastery, Speed, Connectivity, Resilience, Stress, Retention]
                    state = [row['correct'], row['speed'], 1.0, 1.0, row['stress'], 1.0]
                    data.append(state)
        return np.array(data)

    def load_asia_tribe(self, nrows=5000):
        print("🌏 Processing Asian Tribe (Junyi)...")
        if os.path.exists(self.asia_user_file):
            df = pd.read_csv(self.asia_user_file, nrows=nrows)
            data = []
            for _, row in df.iterrows():
                # Mastery: Based on points / Resilience: Based on badges
                mastery = min(1.0, row['points'] / 50000)
                resilience = min(1.0, row['badges_cnt'] / 10)
                # We use defaults for speed/stress since they aren't in this specific file
                state = [mastery, 0.6, 1.0, resilience, 0.3, 1.0]
                data.append(state)
            return np.array(data)
        return np.array([])
