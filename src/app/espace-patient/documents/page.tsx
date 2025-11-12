"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, FilePlus } from "lucide-react";
import PatientLayout from "@/components/PatientLayout";
import { usePatientDocuments, useReferralPDFs } from "@/hooks/patient";
import {
  DocumentCard,
  ReferralPDFList,
  DocumentUploadModal,
} from "@/components/patient";
import { DOCUMENT_TYPES } from "@/types/patient";

export default function DocumentsPage() {
  const { documents, isLoading, refetchDocuments } = usePatientDocuments();
  const { referralPDFs } = useReferralPDFs();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadSuccess = () => {
    refetchDocuments();
  };

  // Group documents by type for stats
  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Documents</h2>
            <p className="text-gray-600">
              Gérez vos documents médicaux et lettres de référence
            </p>
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            <span>Ajouter un document</span>
          </Button>
        </div>

        {/* Referral PDFs Section */}
        <ReferralPDFList pdfs={referralPDFs} />

        {/* Document Type Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {DOCUMENT_TYPES.map((type) => {
            const count = groupedDocuments[type.value]?.length || 0;
            return (
              <Card
                key={type.value}
                className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
              >
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium text-sm">{type.label}</h3>
                  <p className="text-xs text-gray-600">
                    {count} document{count !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* All Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Tous mes documents
            </CardTitle>
            <CardDescription>
              Documents que vous avez téléchargés ({documents.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FilePlus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Aucun document</p>
                <p className="text-sm mt-1">
                  Commencez par télécharger un document médical
                </p>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter mon premier document
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Modal */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </PatientLayout>
  );
}
