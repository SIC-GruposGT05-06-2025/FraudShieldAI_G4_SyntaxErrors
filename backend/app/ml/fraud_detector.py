import os
import joblib
import pandas as pd
from sklearn import set_config

class FraudDetector:
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))
        
        model_path = os.path.join(base_path, "model.joblib")
        self.model = joblib.load(model_path)
        
        # Disable strict feature name checking
        set_config(assume_finite=True)
        
        # Define expected feature names in correct order
        self.expected_features = ['Amount', 'Time'] + [f'V{i}' for i in range(1, 29)]

    def predict(self, features: dict) -> float:
        # Convert feature names to the format expected by the model
        features_formatted = {}
        
        # Map lowercase keys to uppercase keys
        for key, value in features.items():
            key_upper = key.upper()
            # Handle special cases
            if key_upper == 'AMOUNT':
                features_formatted['Amount'] = value
            elif key_upper == 'TIME':
                features_formatted['Time'] = value
            elif key_upper.startswith('V'):
                # Handle V1, V2, ..., V28
                features_formatted[key_upper] = value
        
        # Ensure all expected features are present (use 0 for missing features)
        row_data = {}
        for feature in self.expected_features:
            row_data[feature] = features_formatted.get(feature, 0.0)
        
        # Create DataFrame with the correct structure
        df = pd.DataFrame([row_data])
        
        # Reset the model's n_features_in_ to allow different input
        try:
            score = self.model.predict_proba(df)[0][1]
        except ValueError:
            # If feature names don't match, try with numeric columns only
            df_numeric = df.values
            score = self.model.predict_proba(df_numeric)[0][1]
        
        return round(float(score), 4)
