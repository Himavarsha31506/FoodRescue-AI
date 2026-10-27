# FoodRescue AI — Python Machine Learning Microservice

This microservice provides an enterprise Random Forest Regressor trained on historical dining surplus logs to forecast daily surplus food in kilograms with 95% confidence intervals and kitchen batch adjustments.

## Prerequisites
- Python 3.9+
- pip

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate synthetic historical dataset & train model:**
   ```bash
   python train.py
   ```
   This will train the Scikit-learn `RandomForestRegressor`, benchmark against a baseline `DummyRegressor(strategy='mean')`, report MAE, RMSE, and R² scores, and serialize the trained model artifact to `trained_model.joblib`.

3. **Launch the FastAPI Prediction Server:**
   ```bash
   uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```

## Endpoints
- `GET /health`: Health status of prediction daemon
- `POST /predict-surplus`: Predicts surplus food quantity (kg), bounds, and kitchen actions
- `POST /evaluate-model`: Evaluates model performance vs baseline dummy regressor
