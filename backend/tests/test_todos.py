from fastapi import status

def test_create_todo_success(client, auth_headers):
    todo_data = {
        "title": "Test ToDo Item",
        "description": "This is a test description",
        "due_date": "2026-12-31T23:59:59",
        "tags": ["testing", "pytest"]
    }
    response = client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == todo_data["title"]
    assert data["description"] == todo_data["description"]
    assert len(data["tags"]) == 2

def test_create_todo_validation_failure(client, auth_headers):
    # Title too short (min_length=3 in schema)
    todo_data = {"title": "ab", "description": "Too short"}
    response = client.post("/api/v1/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_todo_not_found(client, auth_headers):
    response = client.get("/api/v1/todos/99999", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_todos_isolation_between_users(client, test_user, auth_headers):
    # Create todo for user 1
    client.post("/api/v1/todos", json={"title": "User 1 Task"}, headers=auth_headers)
    
    # Create user 2 and login
    user2_data = {"email": "user2@example.com", "password": "password123"}
    client.post("/api/v1/auth/register", json=user2_data)
    login_res = client.post("/api/v1/auth/login", json=user2_data)
    token2 = login_res.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    # Create todo for user 2
    client.post("/api/v1/todos", json={"title": "User 2 Task"}, headers=headers2)
    
    # User 2 should only see 1 todo
    response = client.get("/api/v1/todos", headers=headers2)
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "User 2 Task"

def test_update_todo_success(client, auth_headers):
    # Create
    create_res = client.post("/api/v1/todos", json={"title": "Update Me"}, headers=auth_headers)
    todo_id = create_res.json()["id"]
    
    # Update
    update_data = {"title": "Updated Title", "is_done": True, "description": "New desc"}
    response = client.put(f"/api/v1/todos/{todo_id}", json=update_data, headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Updated Title"
    assert response.json()["is_done"] is True
