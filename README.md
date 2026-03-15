# ToDo List FastAPI & React

A full-stack Todo application built with FastAPI (Backend) and React (Frontend). This project demonstrates a production-ready architecture with authentication, persistent storage, and automated testing.

## 🚀 Features

- **JWT Authentication**: Secure user registration and login.
- **Task Management**: Full CRUD operations for personal tasks.
- **Categorization**: Support for Tags (Many-to-Many relationship).
- **Deadlines**: Set due dates for tasks with overdue tracking.
- **Advanced Filtering**: Filter by status, search by title, sort by date/deadline.
- **Pagination**: Efficiently handle large lists of tasks.
- **Responsive UI**: Modern, glassmorphic design built with React.
- **Automated Testing**: Comprehensive test suite using Pytest.

## 📁 Project Structure

```text
Todolist_fastAPI/
├─ frontend/                # React application (Vite)
│  ├─ src/
│  │  ├─ App.jsx            # Main application logic
│  │  └─ App.css            # Custom styles
│  └─ index.html
└─ backend/                 # FastAPI application
   ├─ core/                 # Security, config, and dependencies
   ├─ db/                   # Database connection and base models
   ├─ models/               # SQLAlchemy models
   ├─ repositories/         # Data access layer
   ├─ routers/              # API endpoints
   ├─ schemas/              # Pydantic validation schemas
   ├─ services/             # Business logic layer
   ├─ tests/                # Automated tests (Pytest)
   ├─ alembic/              # Database migrations
   ├─ main.py               # Application entry point
   └─ requirements.txt      # Python dependencies
```

## 🛠️ Installation & Setup

### Backend

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**:
   ```bash
   alembic upgrade head
   ```

4. **Start the server**:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://127.0.0.1:8000`.

### Frontend

1. **Navigate to frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## 🧪 Running Tests

Ensure you are in the `backend` directory and run:

```bash
cd backend
pytest -v
```

The tests use an isolated SQLite database (`test_todos.db`) which is automatically created and cleaned up.

## 📖 API Documentation

Once the backend is running, you can explore the interactive API docs:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)