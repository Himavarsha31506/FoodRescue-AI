"""
FoodRescue AI - Machine Learning Model Trainer
Trains a Random Forest Regressor on historical surplus food logs and benchmarks against
a Baseline Dummy Regressor. Computes MAE, RMSE, and R2 without data leakage.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from data_generator import generate_historical_dataset

def train_and_evaluate():
    print("Generating training dataset...")
    df = generate_historical_dataset(n_samples=1500)
    
    # Feature columns
    cat_dummies = pd.get_dummies(df['category'], prefix='cat', drop_first=True)
    features = pd.concat([
        df[['day_of_week', 'month', 'quantity_prepared_kg', 'historical_demand_average_kg', 'is_holiday_or_event']],
        cat_dummies
    ], axis=1)
    
    target = df['surplus_kg']
    
    # Train / Test split (80 / 20)
    X_train, X_test, y_train, y_test = train_test_split(
        features, target, test_size=0.20, random_state=42
    )

    # 1. Random Forest Regressor
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))
    rf_r2 = r2_score(y_test, rf_preds)

    # 2. Baseline Dummy Regressor (predicts mean of training set)
    dummy_model = DummyRegressor(strategy='mean')
    dummy_model.fit(X_train, y_train)
    dummy_preds = dummy_model.predict(X_test)
    
    dummy_mae = mean_absolute_error(y_test, dummy_preds)
    dummy_rmse = np.sqrt(mean_squared_error(y_test, dummy_preds))
    dummy_r2 = r2_score(y_test, dummy_preds)

    print("\n--- MODEL BENCHMARK RESULTS ---")
    print(f"Random Forest  -> MAE: {rf_mae:.2f} kg, RMSE: {rf_rmse:.2f} kg, R²: {rf_r2:.3f}")
    print(f"Dummy Baseline -> MAE: {dummy_mae:.2f} kg, RMSE: {dummy_rmse:.2f} kg, R²: {dummy_r2:.3f}")
    improvement = ((dummy_mae - rf_mae) / dummy_mae) * 100
    print(f"Random Forest MAE Error Reduction: {improvement:.1f}%\n")

    # Save artifacts
    artifacts = {
        'model': rf_model,
        'feature_names': list(features.columns),
        'metrics': {
            'rf_mae': round(float(rf_mae), 2),
            'rf_rmse': round(float(rf_rmse), 2),
            'rf_r2': round(float(rf_r2), 3),
            'dummy_mae': round(float(dummy_mae), 2),
            'dummy_rmse': round(float(dummy_rmse), 2),
            'dummy_r2': round(float(dummy_r2), 3),
            'improvement_pct': round(float(improvement), 1),
            'sample_count': len(df)
        }
    }
    
    out_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(out_dir, 'trained_model.joblib')
    joblib.dump(artifacts, model_path)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_and_evaluate()
