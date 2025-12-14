import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import os

DATA_PATH = "ml/data/creditcard.csv"
MODEL_PATH = "ml/model.joblib"

def load_data():
    df = pd.read_csv(DATA_PATH)

    # Features del dataset
    X = df.drop("Class", axis=1)
    y = df["Class"]

    return train_test_split(X, y, test_size=0.2, random_state=42)

def train_model():
    X_train, X_test, y_train, y_test = load_data()

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        n_jobs=-1,
        class_weight="balanced"
    )

    print("Entrenando modelo...")
    model.fit(X_train, y_train)

    print("Evaluando...")
    preds = model.predict(X_test)
    print(classification_report(y_test, preds))

    # Guardar modelo
    os.makedirs("ml", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Modelo guardado en {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
