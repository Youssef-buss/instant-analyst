# Instant analyst 

Full-stack AI Data Analyst platform.

##  Features
- Upload datasets (CSV / Excel)
- Automatic analysis (ML)
- Smart insights
- Natural language Q&A
- Chart generation

## Architecture
- Backend: Node.js (REST API)
- ML Engine: FastAPI + Pandas
- Frontend: React

##  Run locally

### Backend
cd backend
npm install
npm start

### ML
cd ml
pip install -r requirements.txt
uvicorn app:app --reload

### Frontend
cd frontend
npm install
npm start
