import os
import joblib
import pandas as pd
import numpy as np
import logging
from sklearn import set_config

logger = logging.getLogger(__name__)
if not logger.handlers:
    # Basic configuration for simple debugging in local/dev
    logging.basicConfig(level=logging.INFO)


class FraudDetector:
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))

        model_path = os.path.join(base_path, "model.joblib")
        self.model = joblib.load(model_path)

        # Disable strict feature name checking where applicable
        set_config(assume_finite=True)

        # Define expected feature names in correct order (Time, V1..V28, Amount)
        self.expected_features = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]

        # Store classes if available for robust proba indexing
        self.model_classes = getattr(self.model, "classes_", None)
        logger.info(f"Loaded model from %s, classes: %s", model_path, self.model_classes)

    def predict(self, features: dict) -> float:
        """Return probability of fraud (class==1) as float between 0 and 1.

        This method normalizes input keys to the expected names, builds a
        DataFrame with the correct column order, and then returns the
        probability corresponding to the fraud class. It falls back to
        numeric-array prediction if DataFrame input fails.
        """
        # Convert feature names to the format expected by the model
        features_formatted = {}

        for key, value in features.items():
            key_upper = key.upper()
            if key_upper == "AMOUNT":
                features_formatted["Amount"] = value
            elif key_upper == "TIME":
                features_formatted["Time"] = value
            elif key_upper.startswith("V"):
                # V1..V28
                # Ensure V keys are capitalized like V1, V2 ...
                features_formatted[key_upper] = value

        # Ensure all expected features are present (use 0 for missing features)
        row_data = {}
        for feature in self.expected_features:
            # Support both 'V1' and 'v1' variants if present in input mapping
            row_data[feature] = features_formatted.get(feature, 0.0)

        df = pd.DataFrame([row_data], columns=self.expected_features)

        # Try predict_proba with DataFrame first (preserves column names)
        try:
            proba = self.model.predict_proba(df)
        except Exception as e:
            logger.warning("predict_proba with DataFrame failed: %s", e)
            # Fall back to numeric array (model expects raw numpy array)
            try:
                proba = self.model.predict_proba(df.values)
            except Exception as e2:
                logger.error("predict_proba with numpy array also failed: %s", e2)
                raise

        # Determine index of fraud class (class label == 1). If not found,
        # assume second column corresponds to fraud (index 1) if possible.
        fraud_index = 1
        try:
            if self.model_classes is not None:
                # numpy array equality search
                arr = np.array(self.model_classes)
                inds = np.where(arr == 1)[0]
                if len(inds) > 0:
                    fraud_index = int(inds[0])
                else:
                    logger.info("Model classes do not include label '1', using index 1 by default: %s", self.model_classes)
        except Exception:
            logger.exception("Could not determine fraud index from model classes, defaulting to 1")

        score = float(proba[0][fraud_index])
        logger.info("Input row: %s", row_data)
        logger.info("Predicted proba: %s, using fraud_index=%s", proba[0].tolist(), fraud_index)

        return round(float(score), 4)
