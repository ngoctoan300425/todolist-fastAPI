import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import Base, get_db
from main import app
import os

# Use a separate test database
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_todos.db"

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Dispose engine to close all connections before file removal
    engine.dispose()
    # Cleanup after all tests
    if os.path.exists("./test_todos.db"):
        try:
            os.remove("./test_todos.db")
        except PermissionError:
            print("\nWarning: Could not remove test_todos.db because it is still in use.")

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(client):
    user_data = {"email": "test@example.com", "password": "password123"}
    # Try to register
    client.post("/api/v1/auth/register", json=user_data)
    return user_data

@pytest.fixture
def auth_headers(client, test_user):
    response = client.post("/api/v1/auth/login", json=test_user)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
