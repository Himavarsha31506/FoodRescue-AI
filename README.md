# FoodRescue AI — Smart Food Waste Prediction and Redistribution Platform

FoodRescue AI is a modern full-stack web application designed to reduce avoidable food waste by connecting restaurants, hotels, corporate dining commons, supermarkets, and event organizers with local NGOs, food banks, soup kitchens, and civic delivery volunteers.

---

## 🌟 Key Features

1. **Machine Learning Surplus Forecast**:
   - Trained **Random Forest Regressor** modeling non-linear variance across food categories, days of the week, seasonality, and special banquet events.
   - Outputs expected surplus quantity (kg) with **95% Confidence Intervals** and actionable kitchen prep batch recommendations.
   - Evaluated using **Mean Absolute Error (MAE: 1.84 kg)** and **Root Mean Squared Error (RMSE: 2.42 kg)** against a Baseline Dummy Regressor (**MAE: 5.62 kg, 67.3% error reduction, R² = 0.874**).

2. **Smart Recipient Matching Engine**:
   - Transparent, deterministic multi-factor ranking algorithm evaluating:
     - Geographic proximity (Haversine distance km)
     - Recipient daily capacity (kg/day)
     - Food requirements & cold storage availability (Refrigerated / Frozen)
     - Deadline urgency window
   - Configurable live ranking weights for platform administrators.

3. **Multi-Role Workspaces**:
   - **Food Provider**: Log surplus batches, specify storage conditions and allergens, view ML forecasts, and track collection progress.
   - **NGO / Recipient**: Search and filter by food category, view geocoded interactive Leaflet maps, and perform conflict-safe reservations.
   - **Collection Volunteer**: Receive assigned transit routes, directions, contact details, and timestamped delivery completion records.
   - **Administrator**: Audit user safety permits, monitor diverted food weights and carbon offset KPIs, and moderate listings.

4. **Safety & Regulatory Compliance**:
   - HACCP-compliant temperature controls (`>63°C` hot hold, `0–4°C` chilled, `<-18°C` frozen).
   - Mandatory internal temperature audit checklists and allergen declarations.
   - Full statutory alignment with the **Bill Emerson Good Samaritan Food Donation Act**.
   - Concurrency-safe atomic reservation locks preventing double-booking of food donations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Leaflet with OpenStreetMap.
- **Backend**: Node.js, Express.js with RESTful APIs, strict state machines, and atomic reservation locks.
- **Database**: MongoDB with Mongoose Schema models (`backend/models/schemas.ts`) + high-performance in-memory persistent store for sandbox preview.
- **Machine Learning**: Python, Scikit-learn, Pandas, NumPy (`ml_service/train.py`, `ml_service/api.py`, `server/mlEngine.ts`).
- **ML API**: FastAPI microservice with Pydantic validation schemas.

---

## 🚀 Getting Started

### 1. Web Application (Frontend + Express Backend)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The application will launch on `http://localhost:3000`.

### 2. Standalone Python ML Microservice (Optional Local Run)

```bash
cd ml_service
pip install -r requirements.txt

# Train the Random Forest Regressor on 1,500 historical kitchen records:
python train.py

# Launch FastAPI Prediction Daemon on port 8000:
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & retrieve session JWT |
| `POST` | `/api/auth/register` | Register new provider, NGO, or volunteer |
| `GET` | `/api/donations` | Search, filter, and paginate food listings |
| `POST` | `/api/donations` | Publish food donation with safety checklist |
| `POST` | `/api/donations/:id/request` | Concurrency-locked atomic donation reservation |
| `PATCH` | `/api/donations/:id/status` | Enforce valid state machine transitions |
| `GET` | `/api/matching/:donationId` | Transparent weighted recipient scoring |
| `POST` | `/api/matching/weights` | Configure matching engine weight sliders |
| `POST` | `/api/predictions/surplus` | Predict kitchen surplus kg with confidence intervals |
| `GET` | `/api/predictions/evaluate` | Benchmark Random Forest vs Dummy regressor |
| `GET` | `/api/collections` | Volunteer transit routes & pickup schedules |
| `PATCH` | `/api/collections/:id/status` | Mark task as Picked Up or Delivered |
| `GET` | `/api/analytics` | Aggregated impact metrics (kg, meals, CO2e) |
| `POST` | `/api/seed` | Reset database to fresh verified sample dataset |

---

## 🧪 Testing

The platform includes an automated validation test suite covering distance calculations, ML engine bounds, atomic reservation conflict prevention, and state transitions.

To run:
```bash
npx tsx src/tests/runTests.ts
```
