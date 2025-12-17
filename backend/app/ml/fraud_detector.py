import os
import joblib
import pandas as pd

logger = logging.getLogger(__name__)
if not logger.handlers:
    # Basic configuration for simple debugging in local/dev
    logging.basicConfig(level=logging.INFO)


class FraudDetector:
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_path, "model.joblib")

        self.model = joblib.load(model_path)

        # ORDEN Y NOMBRES EXACTOS DEL CSV
        self.expected_features = (
            ["Time"] +
            [f"V{i}" for i in range(1, 29)] +
            ["Amount"]
        )

    def predict(self, features: dict) -> float:
        formatted = {}

        for key, value in features.items():
            key_upper = key.upper()

            if key_upper == "TIME":
                formatted["Time"] = value
            elif key_upper == "AMOUNT":
                formatted["Amount"] = value
            elif key_upper.startswith("V"):
                formatted[key_upper] = value

        row = {
            feature: formatted.get(feature, 0.0)
            for feature in self.expected_features
        }

        df = pd.DataFrame([row])

        print(self.model.feature_names_in_)
        print(df.columns.tolist())

        score = self.model.predict_proba(df)[0][1]
        return round(float(score), 4)
