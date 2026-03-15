from fastapi import status

def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "password123"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["email"] == "newuser@example.com"
    assert "id" in response.json()

def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json=test_user
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user["email"], "password": "wrongpassword"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid credentials"

def test_access_protected_endpoint_without_token(client):
    response = client.get("/api/v1/todos")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Not authenticated"
