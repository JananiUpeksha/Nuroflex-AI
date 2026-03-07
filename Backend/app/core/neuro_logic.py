import numpy as np
from datetime import datetime

def calculate_retention(last_seen: datetime, stability: int) -> float:
    """
    Implements Ebbinghaus Forgetting Curve: R = e^(-t/S)
    t = time elapsed
    S = stability of memory (increases with reviews)
    """
    now = datetime.now()
    delta = (now - last_seen).total_seconds() / 3600  # time in hours
    
    # Stability starts at 1.0 and grows as the student reviews more
    S = 1.0 + (stability * 0.5) 
    
    retention = np.exp(-delta / S)
    return round(retention, 2)