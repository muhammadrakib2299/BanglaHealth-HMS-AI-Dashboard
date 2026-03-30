"""Tests for the /api/auth endpoints (register, login, /me)."""

from tests.conftest import register_user, login_user


# ---- Registration --------------------------------------------------------


def test_register_new_user(client):
    resp = register_user(client, email="newuser@example.com", full_name="New User")
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "doctor"
    assert data["is_active"] is True
    assert "id" in data


def test_register_duplicate_email_fails(client):
    register_user(client, email="dup@example.com")
    resp = register_user(client, email="dup@example.com")
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"].lower()


# ---- Login ---------------------------------------------------------------


def test_login_valid_credentials(client):
    register_user(client, email="login@example.com", password="secret123")
    resp = login_user(client, email="login@example.com", password="secret123")
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@example.com"


def test_login_wrong_password_fails(client):
    register_user(client, email="wrongpw@example.com", password="correct")
    resp = login_user(client, email="wrongpw@example.com", password="incorrect")
    assert resp.status_code == 401
    assert "invalid" in resp.json()["detail"].lower()


# ---- /me ----------------------------------------------------------------


def test_get_me_with_valid_token(client):
    register_user(client, email="me@example.com", password="pass123", full_name="Me User")
    login_resp = login_user(client, email="me@example.com", password="pass123")
    token = login_resp.json()["access_token"]

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "me@example.com"
    assert data["full_name"] == "Me User"


def test_get_me_without_token_fails(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
