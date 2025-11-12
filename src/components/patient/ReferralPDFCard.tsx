/**
 * ReferralPDFCard Component
 * Displays a referral PDF with view and download actions
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Eye, FileText } from "lucide-react";
import type { ReferralPDF } from "@/types/patient";

interface ReferralPDFCardProps {
  pdf: ReferralPDF;
}

export function ReferralPDFCard({ pdf }: ReferralPDFCardProps) {
  const handleView = () => {
    window.open(pdf.pdf_url, "_blank");
  };

  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = pdf.pdf_url;
    link.download = `referral_${pdf.specialist_name}.pdf`;
    link.click();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:shadow-md transition-all">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            Référence pour {pdf.specialist_name}
          </p>
          <p className="text-sm text-gray-600">
            Assigné par {pdf.assigned_by_name}
          </p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(pdf.generated_at).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleView}
          className="hover:bg-blue-50"
        >
          <Eye className="h-4 w-4 mr-1" />
          Voir
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          className="hover:bg-blue-50"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface ReferralPDFListProps {
  pdfs: ReferralPDF[];
}

export function ReferralPDFList({ pdfs }: ReferralPDFListProps) {
  if (pdfs.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <FileText className="h-5 w-5 mr-2" />
          Lettres de Référence
        </CardTitle>
        <CardDescription>
          PDFs générés par votre médecin traitant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pdfs.map((pdf) => (
            <ReferralPDFCard key={pdf.id} pdf={pdf} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
