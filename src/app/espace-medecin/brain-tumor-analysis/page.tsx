"use client";

import { useState } from "react";
import DoctorLayout from "@/components/DoctorLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Download, Brain } from "lucide-react";
import { healthPredictionsAPI } from "@/lib/api";
import Image from "next/image";

interface SegmentationResult {
  original_image: string;
  segmentation_mask: string;
  comparison_image: string;
  processing_time: number;
  timestamp?: string;
}

export default function BrainTumorAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<SegmentationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/bmp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid image file (PNG, JPG, JPEG, BMP, or GIF)");
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSegmentation = async () => {
    if (!selectedFile) {
      setError("Please select an image file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      console.log("Sending segmentation request...");
      const response = await healthPredictionsAPI.segmentBrainTumor(formData);

      console.log("Response:", response);

      if (response.success) {
        setSuccess("Brain tumor segmentation completed successfully!");
        setResult({
          original_image: response.original_image,
          segmentation_mask: response.segmentation_mask,
          comparison_image: response.comparison_image,
          processing_time: response.processing_time,
          timestamp: new Date().toISOString(),
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setError(response.error || "Failed to process image");
      }
    } catch (err: unknown) {
      console.error("Segmentation error:", err);
      let errorMessage = "Failed to process image";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        const errorObj = err as Record<string, unknown>;
        if (errorObj.response) {
          const response = errorObj.response as Record<string, unknown>;
          const data = response.data as Record<string, unknown>;
          errorMessage = (data.error as string) || (data.detail as string) || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (imageBase64: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${imageBase64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analyse de Tumeur Cérébrale (RMI)
              </h1>
              <p className="text-gray-600 mt-1">
                Téléchargez une image RMI/TDM pour une segmentation automatique de
                tumeur cérébrale
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Télécharger une Image RMI</CardTitle>
            <CardDescription>
              Format accepté: PNG, JPG, JPEG, BMP, GIF (Max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedFile
                        ? selectedFile.name
                        : "Cliquez pour sélectionner une image"}
                    </p>
                    <p className="text-sm text-gray-500">
                      ou glissez-déposez l&apos;image ici
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="relative w-full max-w-md mx-auto">
                <div className="relative w-full aspect-square">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg border border-gray-300"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Aperçu de l&apos;image
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                ✓ {success}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSegmentation}
              disabled={!selectedFile || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement en cours... (Veuillez patienter)
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Démarrer l&apos;analyse
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Résultat de la Segmentation</CardTitle>
              <CardDescription>
                Traitement effectué en {result.processing_time}s
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comparison Image */}
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Comparaison (Image Originale | Segmentation)
                    </h3>
                    <div className="relative w-full border rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={`data:image/png;base64,${result.comparison_image}`}
                        alt="Comparison"
                        className="w-full h-auto"
                        onError={(e) => console.error("Comparison image failed to load:", e)}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      ℹ️ Gauche: Image originale | Droite: Masque de segmentation (zones blanches = tumeur détectée)
                    </p>
                  </div>
                </div>

                {/* Original Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Image Originale</h3>
                    <div className="relative w-full border rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={`data:image/png;base64,${result.original_image}`}
                        alt="Original"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() =>
                        downloadImage(
                          result.original_image,
                          `original_rmi_${Date.now()}.png`
                        )
                      }
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Télécharger
                    </Button>
                  </div>

                  {/* Segmentation Mask */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Masque de Segmentation
                    </h3>
                    <div className="relative w-full border rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={`data:image/png;base64,${result.segmentation_mask}`}
                        alt="Segmentation"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() =>
                        downloadImage(
                          result.segmentation_mask,
                          `segmentation_rmi_${Date.now()}.png`
                        )
                      }
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">💡 Info:</span> Cette analyse
                    est un outil d&apos;assistance diagnostic. Les résultats doivent
                    être validés par un professionnel médical qualifié.
                  </p>
                </div>

                {/* Reset Button */}
                <Button
                  onClick={() => {
                    setResult(null);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Nouvelle Analyse
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
}
