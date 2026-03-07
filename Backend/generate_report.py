import matplotlib.pyplot as plt

def create_neuro_graph():
    # We'll use your simulation data (you can manually update these from your log)
    steps = [1, 2, 3, 4, 5]
    mastery = [0.5, 0.6, 0.7, 0.7, 0.8] # Mastery grew during Learning steps
    stress = [0.2, 0.25, 0.3, 0.1, 0.15] # Stress dropped during 'Take a Break' (Step 4)

    plt.figure(figsize=(10, 6))
    plt.plot(steps, mastery, marker='o', label='Mastery (Connectivity)', color='blue', linewidth=2)
    plt.plot(steps, stress, marker='s', label='Cognitive Load (Stress)', color='red', linewidth=2)

    plt.title('NeuroFlex AI: Impact of Interventions on Student Brain State')
    plt.xlabel('Simulation Step')
    plt.ylabel('Pillar Level (0.0 - 1.0)')
    plt.legend()
    plt.grid(True)
    
    plt.savefig('neuro_impact_report.png')
    print("📊 Graph saved as 'neuro_impact_report.png'!")

if __name__ == "__main__":
    create_neuro_graph()
