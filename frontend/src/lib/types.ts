export interface Patient {
  id: number;
  full_name: string;
  age: number;
  gender: "male" | "female" | "other";
  district: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  latest_risk_level: string | null;
  latest_risk_score: number | null;
}

export interface PatientList {
  patients: Patient[];
  total: number;
  page: number;
  per_page: number;
}

export interface Vitals {
  id: number;
  patient_id: number;
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree: number;
  age: number;
  recorded_at: string;
}

export interface Prediction {
  id: number;
  patient_id: number;
  vitals_id: number;
  risk_level: "low" | "medium" | "high";
  risk_score: number;
  shap_values: Record<string, number>;
  top_features: { feature: string; impact: number; direction: string }[];
  predicted_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
}

export interface Doctor {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_patients: number;
  high_risk_count: number;
  predictions_today: number;
  appointments_today: number;
}

export interface XrayResult {
  id: number;
  patient_id: number;
  image_path: string;
  pneumonia_probability: number;
  confidence: number;
  uploaded_at: string;
}
