"""Tests for the /api/patients endpoints."""

import pytest

from tests.conftest import get_auth_header


PATIENT_PAYLOAD = {
    "full_name": "Rahim Uddin",
    "age": 45,
    "gender": "male",
    "district": "Dhaka",
    "phone": "01712345678",
    "address": "123 Main St, Dhaka",
}


# ---- helpers -------------------------------------------------------------


def _create_patient(client, headers, **overrides):
    payload = {**PATIENT_PAYLOAD, **overrides}
    return client.post("/api/patients/", json=payload, headers=headers)


# ---- Create patient ------------------------------------------------------


def test_create_patient(client, auth_header):
    resp = _create_patient(client, auth_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == PATIENT_PAYLOAD["full_name"]
    assert data["age"] == PATIENT_PAYLOAD["age"]
    assert data["gender"] == "male"
    assert data["district"] == "Dhaka"
    assert "id" in data
    assert "created_at" in data


# ---- List patients -------------------------------------------------------


def test_list_patients(client, auth_header):
    # Create two patients
    _create_patient(client, auth_header, full_name="Patient A")
    _create_patient(client, auth_header, full_name="Patient B")

    resp = client.get("/api/patients/", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert "patients" in data
    assert "total" in data
    assert data["total"] >= 2
    names = [p["full_name"] for p in data["patients"]]
    assert "Patient A" in names
    assert "Patient B" in names


# ---- Get patient by ID --------------------------------------------------


def test_get_patient_by_id(client, auth_header):
    create_resp = _create_patient(client, auth_header, full_name="Lookup Patient")
    patient_id = create_resp.json()["id"]

    resp = client.get(f"/api/patients/{patient_id}", headers=auth_header)
    assert resp.status_code == 200
    assert resp.json()["id"] == patient_id
    assert resp.json()["full_name"] == "Lookup Patient"


# ---- Update patient ------------------------------------------------------


def test_update_patient(client, auth_header):
    create_resp = _create_patient(client, auth_header, full_name="Before Update")
    patient_id = create_resp.json()["id"]

    resp = client.put(
        f"/api/patients/{patient_id}",
        json={"full_name": "After Update", "age": 50},
        headers=auth_header,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["full_name"] == "After Update"
    assert data["age"] == 50
    # Unchanged fields should remain
    assert data["district"] == "Dhaka"


# ---- Patient not found ---------------------------------------------------


def test_patient_not_found_returns_404(client, auth_header):
    resp = client.get("/api/patients/999999", headers=auth_header)
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()
