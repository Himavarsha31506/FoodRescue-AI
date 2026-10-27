"""
FoodRescue AI - Machine Learning Synthetic Dataset Generator
Generates realistic historical dining and kitchen preparation data with actual seasonal,
day-of-week, event, and category-dependent surplus distribution.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_historical_dataset(n_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    
    categories = ['COOKED_MEALS', 'BAKERY_PASTRY', 'FRESH_PRODUCE', 'DAIRY_EGGS', 'PACKAGED_GOODS', 'BEVERAGES']
    cat_surplus_ratios = {
        'COOKED_MEALS': (0.18, 0.05),
        'BAKERY_PASTRY': (0.24, 0.06),
        'FRESH_PRODUCE': (0.25, 0.07),
        'DAIRY_EGGS': (0.14, 0.04),
        'PACKAGED_GOODS': (0.07, 0.03),
        'BEVERAGES': (0.11, 0.03)
    }

    start_date = datetime(2025, 1, 1)
    data = []

    for i in range(n_samples):
        log_date = start_date + timedelta(days=int(i % 365))
        day_of_week = log_date.weekday() # 0 = Monday, 6 = Sunday
        month = log_date.month
        
        category = np.random.choice(categories, p=[0.35, 0.20, 0.20, 0.10, 0.10, 0.05])
        
        # Base prep volume by category
        if category in ['COOKED_MEALS', 'FRESH_PRODUCE']:
            qty_prepared = float(np.random.normal(90, 25))
        elif category == 'BAKERY_PASTRY':
            qty_prepared = float(np.random.normal(45, 15))
        else:
            qty_prepared = float(np.random.normal(55, 20))
        qty_prepared = max(10.0, round(qty_prepared, 1))

        # Demand and baseline
        mean_ratio, std_ratio = cat_surplus_ratios[category]
        is_weekend = day_of_week in [5, 6]
        is_monday = day_of_week == 0
        is_holiday = bool(np.random.rand() < 0.08)

        # Fluctuations
        factor = 1.0
        if is_monday:
            factor *= 1.25 # higher surplus after weekends
        if is_holiday:
            factor *= 1.35
        if is_weekend:
            factor *= 0.95

        effective_ratio = np.clip(np.random.normal(mean_ratio * factor, std_ratio), 0.02, 0.50)
        surplus_kg = round(float(qty_prepared * effective_ratio), 1)
        sold_kg = round(max(0.0, qty_prepared - surplus_kg), 1)
        hist_demand = round(float(np.random.normal(qty_prepared * 0.85, 10)), 1)
        hist_demand = max(5.0, hist_demand)

        data.append({
            'date': log_date.strftime('%Y-%m-%d'),
            'day_of_week': day_of_week,
            'month': month,
            'category': category,
            'quantity_prepared_kg': qty_prepared,
            'historical_demand_average_kg': hist_demand,
            'is_holiday_or_event': int(is_holiday),
            'quantity_sold_kg': sold_kg,
            'surplus_kg': surplus_kg
        })

    df = pd.DataFrame(data)
    return df

if __name__ == '__main__':
    df = generate_historical_dataset()
    df.to_csv('food_surplus_training_data.csv', index=False)
    print(f"Generated {len(df)} historical records saved to food_surplus_training_data.csv")
    print(df.head(5))
