/**
 * DocumentUploadModal Component
 * Modal for uploading new patient documents
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { useDocumentUpload } from "@/hooks/patient";
import { DOCUMENT_TYPES, type DocumentUploadData } from "@/types/patient";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const { uploadDocument, isUploading } = useDocumentUpload();
  const [uploadData, setUploadData] = useState<DocumentUploadData>({
    title: "",
    description: "",
    document_type: "other",
    file: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier ne doit pas dépasser 10 MB");
        return;
      }
      setUploadData({ ...uploadData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await uploadDocument(uploadData);
    if (success) {
      // Reset form
      setUploadData({
        title: "",
        description: "",
        document_type: "other",
        file: null,
      });
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Télécharger un document</DialogTitle>
          <DialogDescription>
            Ajoutez un document médical à votre dossier
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Titre du document <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Résultats d'analyse de sang"
              value={uploadData.title}
              onChange={(e) =>
                setUploadData({ ...uploadData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type" className="font-medium">
              Type de document
            </Label>
            <select
              id="document_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={uploadData.document_type}
              onChange={(e) =>
                setUploadData({
                  ...uploadData,
                  document_type: e.target.value,
                })
              }
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description (optionnel)
            </Label>
            <textarea
              id="description"
              placeholder="Notes ou détails supplémentaires..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              value={uploadData.description}
              onChange={(e) =>
                setUploadData({
                  ...uploadData,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="font-medium">
              Fichier <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              required
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Formats acceptés: PDF, JPG, PNG, DOC, DOCX, TXT (Max 10 MB)
            </p>
            {uploadData.file && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                <span className="text-sm text-gray-700">
                  {uploadData.file.name}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setUploadData({ ...uploadData, file: null })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Télécharger
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
