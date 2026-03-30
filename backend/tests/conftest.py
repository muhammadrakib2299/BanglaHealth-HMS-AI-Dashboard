"""
Shared fixtures for the BanglaHealth HMS test suite.

Uses an in-memory SQLite database so tests never touch PostgreSQL.
"""

import sys
import os

# Ensure the backend package root is on sys.path so that bare imports
# like ``from main import app`` resolve correctly when pytest is invoked
# from the project root.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from database import Base, get_db
from main import app

# ---------------------------------------------------------------------------
# SQLite in-memory engine
# ---------------------------------------------------------------------------

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///file::memory:?cache=shared&uri=true"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# SQLite does not enforce foreign keys by default; enable them.
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    """Create all tables once for the entire test session."""
    # Import every model so that Base.metadata knows about all tables.
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def db_session():
    """
    Yield a fresh DB session for each test and roll back afterwards so that
    tests are isolated from one another.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def override_get_db(db_session):
    """Override FastAPI's ``get_db`` dependency to use the test session."""

    def _get_db_override():
        try:
            yield db_session
        finally:
            pass  # session lifecycle is managed by the db_session fixture

    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    """Return a FastAPI TestClient wired to the test database."""
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------


def register_user(
    client: TestClient,
    email: str = "test@example.com",
    full_name: str = "Test User",
    password: str = "testpassword123",
    role: str = "doctor",
) -> dict:
    """Register a user via the API and return the JSON response."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": full_name,
            "password": password,
            "role": role,
        },
    )
    return response


def login_user(
    client: TestClient,
    email: str = "test@example.com",
    password: str = "testpassword123",
) -> dict:
    """Log in and return the JSON response (contains ``access_token``)."""
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    return response


def get_auth_header(client: TestClient, email: str = "test@example.com", password: str = "testpassword123") -> dict:
    """Register (if needed) + login and return an ``Authorization`` header dict."""
    # Try to register; ignore failure if user already exists.
    register_user(client, email=email, password=password)
    resp = login_user(client, email=email, password=password)
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_header(client) -> dict:
    """Convenience fixture: a valid Authorization header for the default test user."""
    return get_auth_header(client)
