/**
 * usePatientDocuments Hook
 * Manages patient documents and referral PDFs
 */

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { showToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errorHandler";
import type {
  PatientDocument,
  ReferralPDF,
  DocumentUploadData,
} from "@/types/patient";

export function usePatientDocuments() {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        "/api/medical-documents/documents/my_documents/"
      );
      const docs = response.data.results || response.data;
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    isLoading,
    error,
    refetchDocuments: fetchDocuments,
  };
}

export function useReferralPDFs() {
  const [referralPDFs, setReferralPDFs] = useState<ReferralPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralPDFs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/medical-documents/referral-pdfs/");
      const pdfs = response.data.results || response.data;
      setReferralPDFs(pdfs);
    } catch (error) {
      console.error("Error fetching referral PDFs:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralPDFs();
  }, []);

  return {
    referralPDFs,
    isLoading,
    error,
    refetchReferralPDFs: fetchReferralPDFs,
  };
}

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (
    uploadData: DocumentUploadData
  ): Promise<boolean> => {
    if (!uploadData.file) {
      showToast.error("Veuillez sélectionner un fichier");
      return false;
    }

    if (!uploadData.title.trim()) {
      showToast.error("Veuillez entrer un titre");
      return false;
    }

    setIsUploading(true);

    try {
      // Get patient record for current user
      const patientResponse = await api.get("/api/patients/my-record/");
      const patient = patientResponse.data;

      if (!patient) {
        throw new Error("Patient record not found");
      }

      const formData = new FormData();
      formData.append("patient", patient.id.toString());
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("document_type", uploadData.document_type);
      formData.append("file", uploadData.file);
      formData.append("is_visible_to_all_doctors", "true");

      await api.post("/api/medical-documents/documents/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast.success("Document téléchargé avec succès!");
      return true;
    } catch (error: unknown) {
      console.error("Error uploading document:", error);
      const errorMessage = getErrorMessage(error);
      showToast.error("Erreur", errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading,
  };
}
