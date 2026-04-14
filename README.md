# Hostel Management System

A clean full-stack hostel management starter with a FastAPI backend, MySQL schema, and a React + Vite frontend.

## Project Layout

- `schema.sql` - MySQL schema and seed data
- `backend/` - FastAPI app, SQLAlchemy models, routes, and schemas
- `frontend/` - React app with Vite, Tailwind, Axios, and React Router

## Backend Setup

1. Create a MySQL database and import `schema.sql`.
2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root with your database URL:

```env
DATABASE_URL=mysql+mysqlconnector://root:password@localhost:3306/hostel_management
CORS_ORIGINS=http://localhost:5173
```

4. Start the API:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure the frontend API URL in `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:8000
```

3. Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Notes

- The schema matches the requested ER diagram and uses the exact table and column names provided.
- The frontend is built as a practical admin dashboard starter with reusable components and CRUD pages.
- If you want, the next step can be tightening the UI or adding more validation and server-side business rules.
