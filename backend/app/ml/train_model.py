import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(BASE_DIR, "data", "creditcard.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")

def load_data():
    df = pd.read_csv(DATA_PATH)

    # Features del dataset
    X = df.drop("Class", axis=1)
    y = df["Class"]

    return train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

def train_model():
    X_train, X_test, y_train, y_test = load_data()

    model = RandomForestClassifier(
        n_estimators=500,     
        max_depth=5,         
        min_samples_leaf=50,
        min_samples_split=20,
        class_weight={0: 1, 1: 20},
        n_jobs=-1,
        random_state=42
    )

    print("Entrenando modelo (modo DEMO)...")
    model.fit(X_train, y_train)

    print("\nEvaluación clásica (umbral 0.5):")
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))

    print("\nEvaluación por probabilidad:")
    probs = model.predict_proba(X_test)[:, 1]
    print("ROC AUC:", roc_auc_score(y_test, probs))

    # Guardar modelo
    os.makedirs("ml", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"\nModelo guardado en {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
