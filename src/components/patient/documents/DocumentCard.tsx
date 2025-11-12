/**
 * DocumentCard Component
 * Displays a single document with view and download actions
 */

import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  Eye,
  File,
  FileImage,
  FileText,
} from "lucide-react";
import type { PatientDocument } from "@/types/patient";
import { DOCUMENT_TYPES } from "@/types/patient";

interface DocumentCardProps {
  document: PatientDocument;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getDocumentIcon = (extension: string) => {
    if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension)) {
      return <FileImage className="h-6 w-6 text-purple-600" />;
    } else if (extension === ".pdf") {
      return <FileText className="h-6 w-6 text-red-600" />;
    }
    return <File className="h-6 w-6 text-blue-600" />;
  };

  const handleView = () => {
    window.open(document.file_url, "_blank");
  };

  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = document.file_url;
    link.download = document.title;
    link.click();
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {getDocumentIcon(document.file_extension)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{document.title}</p>
          <p className="text-sm text-gray-600">
            {getDocumentTypeLabel(document.document_type)}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(document.uploaded_at).toLocaleDateString("fr-FR")}
            </span>
            <span className="text-xs text-gray-500">{document.file_size}</span>
            {document.specialist_name && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Pour {document.specialist_name}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <Button size="sm" variant="outline" onClick={handleView}>
          <Eye className="h-4 w-4 mr-1" />
          Voir
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
