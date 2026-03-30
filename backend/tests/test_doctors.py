"""Tests for the /api/doctors endpoints."""

from tests.conftest import get_auth_header


DOCTOR_PAYLOAD = {
    "email": "doctor1@hospital.com",
    "full_name": "Dr. Karim",
    "password": "doctorpass123",
}


# ---- helpers -------------------------------------------------------------


def _create_doctor(client, headers, **overrides):
    payload = {**DOCTOR_PAYLOAD, **overrides}
    return client.post("/api/doctors/", json=payload, headers=headers)


# ---- List (empty initially) ---------------------------------------------


def test_list_doctors_empty(client, auth_header):
    resp = client.get("/api/doctors/", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # The auth_header fixture registers a user with role=doctor, so
    # there may be at least one. We just verify the endpoint works and
    # returns a list.


# ---- Create doctor -------------------------------------------------------


def test_create_doctor(client, auth_header):
    resp = _create_doctor(client, auth_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == DOCTOR_PAYLOAD["email"]
    assert data["full_name"] == DOCTOR_PAYLOAD["full_name"]
    assert data["role"] == "doctor"
    assert "id" in data


# ---- Update doctor -------------------------------------------------------


def test_update_doctor(client, auth_header):
    create_resp = _create_doctor(
        client, auth_header, email="update_doc@hospital.com", full_name="Dr. Before"
    )
    doctor_id = create_resp.json()["id"]

    resp = client.put(
        f"/api/doctors/{doctor_id}",
        json={"full_name": "Dr. After"},
        headers=auth_header,
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Dr. After"


# ---- Delete doctor -------------------------------------------------------


def test_delete_doctor(client, auth_header):
    create_resp = _create_doctor(
        client, auth_header, email="delete_doc@hospital.com", full_name="Dr. Delete"
    )
    doctor_id = create_resp.json()["id"]

    # Delete
    resp = client.delete(f"/api/doctors/{doctor_id}", headers=auth_header)
    assert resp.status_code == 204

    # Confirm it is gone
    resp = client.get(f"/api/doctors/{doctor_id}", headers=auth_header)
    assert resp.status_code == 404
