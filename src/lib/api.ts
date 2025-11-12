import axios from "axios";
import { cookieStorage } from "./cookies";
import { getErrorMessage } from "./errorHandler";
import type {
  User,
  PatientFormData,
  AppointmentFormData,
  TimeSlotFormData,
  BulkTimeSlotFormData,
  ConsultationFormData,
  VitalSignsFormData,
  PrescriptionFormData,
  ConsultationNoteFormData,
  RegisterData,
} from "@/types";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests when available (only on client side)
    if (typeof window !== "undefined") {
      const token = cookieStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors and token refresh (only on client side)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      const refreshToken = cookieStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/api/accounts/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          cookieStorage.setTokens(access, refreshToken);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        } catch {
          // Refresh failed, logout user
          cookieStorage.clearTokens();
          window.location.href = "/login";
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    // Enhance error with detailed message before rejecting
    const enhancedError = new Error(getErrorMessage(error)) as Error & {
      response?: typeof error.response;
      originalError?: typeof error;
    };
    enhancedError.response = error.response;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/api/accounts/login/", {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post("/api/accounts/register/", userData);
    return response.data;
  },

  logout: async () => {
    if (typeof window !== "undefined") {
      const refreshToken = cookieStorage.getRefreshToken();
      console.log(
        "Logout - refresh token:",
        refreshToken ? "exists" : "missing"
      );

      if (refreshToken) {
        try {
          await api.post("/api/accounts/logout/", {
            refresh_token: refreshToken,
          });
          console.log("Logout API call successful");
        } catch (error) {
          console.error("Logout API call failed:", error);
          // Continue with local cleanup even if API call fails
        }
      } else {
        console.log("No refresh token found, skipping API call");
      }

      // Always clear tokens locally regardless of API response
      cookieStorage.clearTokens();
    }
  },

  getProfile: async () => {
    const response = await api.get("/api/accounts/profile/");
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>) => {
    const response = await api.put("/api/accounts/profile/", profileData);
    return response.data;
  },
};

// Patients API
export const patientsAPI = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get("/api/patients/", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/patients/${id}/`);
    return response.data;
  },

  create: async (patientData: PatientFormData) => {
    const response = await api.post("/api/patients/", patientData);
    return response.data;
  },

  update: async (id: number, patientData: Partial<PatientFormData>) => {
    const response = await api.put(`/api/patients/${id}/`, patientData);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/patients/${id}/`);
  },

  search: async (query: string) => {
    const response = await api.get(`/api/patients/search/?q=${query}`);
    return response.data;
  },

  getLatestMedicalRecord: async (patientId: number) => {
    const response = await api.get(
      `/api/patients/${patientId}/medical-records/latest/`
    );
    return response.data;
  },
};

// Appointments API
export const appointmentsAPI = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get("/api/appointments/appointments/", {
      params,
    });
    // Handle both array and object responses
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // If wrapped in object (e.g., { results: [...] } or { data: [...] })
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    // If it's a single object, wrap in array
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return [data];
    }
    return [];
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/appointments/${id}/`);
    return response.data;
  },

  create: async (appointmentData: AppointmentFormData) => {
    const response = await api.post("/api/appointments/", appointmentData);
    return response.data;
  },

  bookWithVirtualSlot: async (bookingData: {
    patient: number;
    doctor: number;
    date: string;
    start_time: string;
    end_time: string;
    consultation_type: string;
    reason_for_visit: string;
    symptoms: string;
    priority: string;
    contact_phone: string;
    patient_notes: string;
  }) => {
    const response = await api.post(
      "/api/appointments/appointments/book_with_virtual_slot/",
      bookingData
    );
    return response.data;
  },

  update: async (id: number, appointmentData: Partial<AppointmentFormData>) => {
    const response = await api.put(
      `/api/appointments/appointments/${id}/`,
      appointmentData
    );
    return response.data;
  },

  cancel: async (id: number, reason?: string) => {
    const response = await api.post(
      `/api/appointments/appointments/${id}/cancel/`,
      {
        reason,
      }
    );
    return response.data;
  },

  reschedule: async (id: number, newTimeSlotId: number) => {
    const response = await api.post(
      `/api/appointments/appointments/${id}/reschedule/`,
      {
        new_time_slot_id: newTimeSlotId,
      }
    );
    return response.data;
  },

  complete: async (id: number, doctorNotes?: string) => {
    const response = await api.post(
      `/api/appointments/appointments/${id}/complete/`,
      {
        doctor_notes: doctorNotes,
      }
    );
    return response.data;
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get("/api/appointments/statistics/");
    return response.data;
  },

  getUpcoming: async () => {
    const response = await api.get("/api/appointments/upcoming/");
    return response.data;
  },

  getToday: async () => {
    const response = await api.get("/api/appointments/today/");
    return response.data;
  },

  getAvailableDoctors: async () => {
    const response = await api.get("/api/accounts/doctors/available/");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },

  getAvailableSlots: async (params?: Record<string, unknown>) => {
    // Use the new dynamic available-slots endpoint
    // This generates slots based on doctor's schedule in real-time
    console.log(
      "📡 API Call - getAvailableSlots (dynamic) with params:",
      params
    );
    const response = await api.get(
      "/api/appointments/time-slots/available_slots/",
      {
        params,
      }
    );
    console.log("📥 API Response - raw data:", response.data);
    const data = response.data;

    // Handle different response formats
    if (data.slots && Array.isArray(data.slots)) {
      console.log("✅ Returned with .slots wrapper, count:", data.slots.length);
      return data.slots;
    }
    if (Array.isArray(data)) {
      console.log("✅ Returned as direct array, count:", data.length);
      return data;
    }
    if (data.results && Array.isArray(data.results)) {
      console.log(
        "✅ Returned with .results pagination, count:",
        data.results.length
      );
      return data.results;
    }
    if (data.data && Array.isArray(data.data)) {
      console.log("✅ Returned with .data wrapper, count:", data.data.length);
      return data.data;
    }
    console.log("⚠️ Unexpected response format, returning empty array");
    return [];
  },
};

// Time Slots API
export const timeSlotsAPI = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get("/api/appointments/doctor-availability/", {
      params,
    });
    console.log("TimeSlotsAPI getAll response:", response.data);
    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  create: async (timeSlotData: TimeSlotFormData) => {
    const response = await api.post(
      "/api/appointments/doctor-availability/",
      timeSlotData
    );
    return response.data;
  },

  createBulk: async (bulkData: BulkTimeSlotFormData) => {
    const response = await api.post(
      "/api/appointments/doctor-availability/create_bulk_slots/",
      bulkData
    );
    return response.data;
  },

  update: async (id: number, timeSlotData: Partial<TimeSlotFormData>) => {
    const response = await api.put(
      `/api/appointments/doctor-availability/${id}/`,
      timeSlotData
    );
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/appointments/doctor-availability/${id}/`);
  },

  getDoctorAvailability: async (doctorId: number, date: string) => {
    const response = await api.get("/api/appointments/doctor-availability/", {
      params: { doctor_id: doctorId, date },
    });
    return response.data;
  },
};

// Consultations API
export const consultationsAPI = {
  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get("/api/consultations/api/consultations/", {
      params,
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(
      `/api/consultations/api/consultations/${id}/`
    );
    return response.data;
  },

  create: async (consultationData: ConsultationFormData) => {
    const response = await api.post(
      "/api/consultations/api/consultations/",
      consultationData
    );
    return response.data;
  },

  update: async (
    id: number,
    consultationData: Partial<ConsultationFormData>
  ) => {
    const response = await api.put(
      `/api/consultations/api/consultations/${id}/`,
      consultationData
    );
    return response.data;
  },

  start: async (id: number) => {
    const response = await api.post(
      `/api/consultations/api/consultations/${id}/start_consultation/`
    );
    return response.data;
  },

  complete: async (
    id: number,
    completionData: Partial<ConsultationFormData>
  ) => {
    const response = await api.post(
      `/api/consultations/api/consultations/${id}/complete_consultation/`,
      completionData
    );
    return response.data;
  },

  getPatientHistory: async (id: number) => {
    const response = await api.get(
      `/api/consultations/api/consultations/${id}/patient_history/`
    );
    return response.data;
  },

  // Vital Signs
  getVitalSigns: async (consultationId: number) => {
    const response = await api.get(
      `/api/consultations/api/consultations/${consultationId}/vital-signs/`
    );
    return response.data;
  },

  addVitalSigns: async (
    consultationId: number,
    vitalData: VitalSignsFormData
  ) => {
    const response = await api.post(
      `/api/consultations/api/consultations/${consultationId}/vital-signs/`,
      vitalData
    );
    return response.data;
  },

  // Prescriptions
  getPrescriptions: async (consultationId: number) => {
    const response = await api.get(
      `/api/consultations/api/consultations/${consultationId}/prescriptions/`
    );
    return response.data;
  },

  addPrescription: async (
    consultationId: number,
    prescriptionData: PrescriptionFormData
  ) => {
    const response = await api.post(
      `/api/consultations/api/consultations/${consultationId}/prescriptions/`,
      prescriptionData
    );
    return response.data;
  },

  // Notes
  getNotes: async (consultationId: number) => {
    const response = await api.get(
      `/api/consultations/api/consultations/${consultationId}/notes/`
    );
    return response.data;
  },

  addNote: async (
    consultationId: number,
    noteData: ConsultationNoteFormData
  ) => {
    const response = await api.post(
      `/api/consultations/api/consultations/${consultationId}/notes/`,
      noteData
    );
    return response.data;
  },

  // Statistics
  getStatistics: async () => {
    const response = await api.get("/api/consultations/api/statistics/");
    return response.data;
  },

  getToday: async () => {
    const response = await api.get("/api/consultations/api/today/");
    return response.data;
  },
};

// Health Predictions API
export const healthPredictionsAPI = {
  predict: async (data: {
    age: number;
    sex: number;
    cp: number;
    trestbps: number;
    chol: number;
    fbs: number;
    restecg: number;
    thalach: number;
    exang: number;
    oldpeak: number;
    slope: number;
    ca: number;
    thal: number;
  }) => {
    const response = await api.post(
      "/api/health-predictions/predictions/predict/",
      data
    );
    return response.data;
  },

  getMyPredictions: async () => {
    const response = await api.get(
      "/api/health-predictions/predictions/my_predictions/"
    );
    return response.data;
  },

  getPredictionDetail: async (id: number) => {
    const response = await api.get(
      `/api/health-predictions/predictions/${id}/`
    );
    return response.data;
  },
};

// Medical Records API
export const medicalRecordsAPI = {
  create: async (medicalData: Record<string, unknown>) => {
    const response = await api.post(
      "/api/patients/medical-records/",
      medicalData
    );
    return response.data;
  },

  getPatientLatest: async (patientId: number) => {
    const response = await api.get(
      `/api/patients/${patientId}/medical-records/latest/`
    );
    return response.data;
  },

  getMyRecords: async () => {
    const response = await api.get("/api/patients/my-medical-records/");
    return response.data;
  },

  update: async (id: number, medicalData: Record<string, unknown>) => {
    const response = await api.patch(
      `/api/patients/medical-records/${id}/`,
      medicalData
    );
    return response.data;
  },
};

// Medical Documents API
export const medicalDocumentsAPI = {
  getPatientDocuments: async (patientId: number) => {
    const response = await api.get(
      `/api/medical-documents/documents/patient/${patientId}/`
    );
    return response.data;
  },

  getAll: async (params?: Record<string, unknown>) => {
    const response = await api.get("/api/medical-documents/documents/", {
      params,
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/medical-documents/documents/${id}/`);
    return response.data;
  },

  create: async (documentData: FormData) => {
    const response = await api.post(
      "/api/medical-documents/documents/",
      documentData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  update: async (
    id: number,
    documentData: Partial<Record<string, unknown>>
  ) => {
    const response = await api.patch(
      `/api/medical-documents/documents/${id}/`,
      documentData
    );
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/medical-documents/documents/${id}/`);
  },
};

// Consultations History API
export const consultationHistoryAPI = {
  getPatientConsultations: async (
    patientId: number,
    params?: Record<string, unknown>
  ) => {
    const response = await api.get(
      `/api/consultations/api/patients/${patientId}/consultations/`,
      { params }
    );
    return response.data;
  },

  getConsultationWithDetails: async (consultationId: number) => {
    const response = await api.get(
      `/api/consultations/api/consultations/${consultationId}/`
    );
    return response.data;
  },

  createConsultation: async (consultationData: Record<string, unknown>) => {
    const response = await api.post(
      `/api/consultations/api/consultations/`,
      consultationData
    );
    return response.data;
  },
};

export default api;
