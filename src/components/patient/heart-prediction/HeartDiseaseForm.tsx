"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, Loader2, Heart } from "lucide-react";
import { healthPredictionsAPI } from "@/lib/api";

// Zod validation schema
const heartDiseaseSchema = z.object({
  age: z.number().min(18).max(120, "Age must be between 18 and 120"),
  sex: z
    .enum(["0", "1"])
    .refine((val) => val, { message: "Please select a gender" }),
  cp: z
    .enum(["0", "1", "2", "3"])
    .refine((val) => val, { message: "Please select chest pain type" }),
  trestbps: z
    .number()
    .min(80)
    .max(200, "Resting blood pressure must be between 80-200 mmHg"),
  chol: z
    .number()
    .min(100)
    .max(400, "Cholesterol must be between 100-400 mg/dL"),
  fbs: z.enum(["0", "1"]).refine((val) => val, {
    message: "Please select fasting blood sugar level",
  }),
  restecg: z
    .enum(["0", "1", "2"])
    .refine((val) => val, { message: "Please select resting ECG result" }),
  thalach: z
    .number()
    .min(60)
    .max(220, "Max heart rate must be between 60-220 bpm"),
  exang: z
    .enum(["0", "1"])
    .refine((val) => val, { message: "Please select exercise induced angina" }),
  oldpeak: z.number().min(0).max(10, "ST depression must be between 0-10"),
  slope: z
    .enum(["0", "1", "2"])
    .refine((val) => val, { message: "Please select ST slope" }),
  ca: z
    .enum(["0", "1", "2", "3"])
    .refine((val) => val, { message: "Please select number of major vessels" }),
  thal: z
    .enum(["1", "3", "6", "7"])
    .refine((val) => val, { message: "Please select thalassemia result" }),
});

type HeartDiseaseInput = z.infer<typeof heartDiseaseSchema>;

interface PredictionResult {
  prediction: number;
  confidence: number;
  id?: number;
  created_at?: string;
}

export function HeartDiseaseForm() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HeartDiseaseInput>({
    resolver: zodResolver(heartDiseaseSchema),
    defaultValues: {
      age: 50,
      sex: "0",
      cp: "0",
      trestbps: 120,
      chol: 200,
      fbs: "0",
      restecg: "0",
      thalach: 130,
      exang: "0",
      oldpeak: 0,
      slope: "1",
      ca: "0",
      thal: "1",
    },
  });

  const onSubmit = async (data: HeartDiseaseInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const predictionData = {
        age: data.age,
        sex: parseInt(data.sex),
        cp: parseInt(data.cp),
        trestbps: data.trestbps,
        chol: data.chol,
        fbs: parseInt(data.fbs),
        restecg: parseInt(data.restecg),
        thalach: data.thalach,
        exang: parseInt(data.exang),
        oldpeak: data.oldpeak,
        slope: parseInt(data.slope),
        ca: parseInt(data.ca),
        thal: parseInt(data.thal),
      };

      // API returns an envelope: { success, message, prediction }
      // normalize to the inner prediction object so UI can read `prediction` and `confidence`
      const apiResponse = await healthPredictionsAPI.predict(predictionData);
      // support both envelope and direct prediction responses
      const predictionResult =
        apiResponse && apiResponse.prediction
          ? apiResponse.prediction
          : apiResponse;
      setResult(predictionResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get prediction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result
    ? result.prediction === 1
      ? {
          label: "⚠️ You May Have Heart Disease",
          mainMessage:
            "Based on your health measurements, there are signs that suggest heart disease may be present.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: "danger",
        }
      : {
          label: "✓ Your Heart Looks Healthy",
          mainMessage:
            "Based on your health measurements, there are no clear signs of heart disease.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: "success",
        }
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <div>
              <CardTitle>Heart Disease Risk Assessment</CardTitle>
              <CardDescription>
                Provide your clinical measurements for heart disease risk
                prediction
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {result ? (
            <div className="space-y-6">
              {/* Results Display */}
              <div className={`p-6 rounded-lg border-2 ${riskLevel?.bgColor}`}>
                <div className="flex items-center gap-3 mb-4">
                  {riskLevel?.icon === "danger" ? (
                    <AlertCircle className={`w-8 h-8 ${riskLevel.color}`} />
                  ) : (
                    <CheckCircle className={`w-8 h-8 ${riskLevel?.color}`} />
                  )}
                  <h3 className={`text-2xl font-bold ${riskLevel?.color}`}>
                    {riskLevel?.label}
                  </h3>
                </div>

                <p className="text-base text-gray-800 mb-4">
                  {riskLevel?.mainMessage}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg border">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Test Reliability
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      How confident this test is
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Result</p>
                    <p className={`text-2xl font-bold ${riskLevel?.color}`}>
                      {result.prediction === 1
                        ? "May Have Disease"
                        : "No Disease Signs"}
                    </p>
                  </div>
                </div>

                {result.prediction === 1 && (
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="font-semibold text-yellow-900 mb-2">
                      ⚠️ What You Should Do:
                    </p>
                    <p className="text-sm text-yellow-800">
                      Visit a heart doctor (cardiologist) soon for a proper
                      medical check-up. Don&apos;t worry - this is just a
                      screening tool, not a final diagnosis. Only a real doctor
                      can give you a real diagnosis.
                    </p>
                  </div>
                )}

                {result.prediction === 0 && (
                  <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                    <p className="font-semibold text-green-900 mb-2">
                      ✓ What You Should Do:
                    </p>
                    <p className="text-sm text-green-800">
                      Keep your healthy habits! Exercise regularly, eat well,
                      manage stress, and get regular check-ups from your doctor.
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4 italic">
                  💡 Tip: This is a screening tool to help you understand your
                  risk. It&apos;s not a real medical diagnosis. Always talk to
                  your doctor about your health.
                </p>
              </div>

              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="w-full"
              >
                New Assessment
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                    1
                  </span>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  <div>
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      {...register("age", { valueAsNumber: true })}
                      className="mt-2"
                      min="18"
                      max="120"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="sex">Gender</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("sex", value as "0" | "1")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Female</SelectItem>
                        <SelectItem value="1">Male</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sex && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.sex.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Cardiac Measurements */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                    2
                  </span>
                  Cardiac Measurements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  <div>
                    <Label htmlFor="cp">Chest Pain Type</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("cp", value as "0" | "1" | "2" | "3")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Typical Angina</SelectItem>
                        <SelectItem value="1">Atypical Angina</SelectItem>
                        <SelectItem value="2">Non-Anginal Pain</SelectItem>
                        <SelectItem value="3">Asymptomatic</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.cp && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.cp.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="trestbps">
                      Resting Blood Pressure (mmHg)
                    </Label>
                    <Input
                      id="trestbps"
                      type="number"
                      {...register("trestbps", { valueAsNumber: true })}
                      className="mt-2"
                      min="80"
                      max="200"
                    />
                    {errors.trestbps && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.trestbps.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="chol">Serum Cholesterol (mg/dL)</Label>
                    <Input
                      id="chol"
                      type="number"
                      {...register("chol", { valueAsNumber: true })}
                      className="mt-2"
                      min="100"
                      max="400"
                    />
                    {errors.chol && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.chol.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="thalach">
                      Maximum Heart Rate Achieved (bpm)
                    </Label>
                    <Input
                      id="thalach"
                      type="number"
                      {...register("thalach", { valueAsNumber: true })}
                      className="mt-2"
                      min="60"
                      max="220"
                    />
                    {errors.thalach && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.thalach.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Clinical Tests */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                    3
                  </span>
                  Clinical Tests & Indicators
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  <div>
                    <Label htmlFor="fbs">
                      Fasting Blood Sugar &gt; 120 mg/dL
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("fbs", value as "0" | "1")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.fbs && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.fbs.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="restecg">Resting ECG Result</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("restecg", value as "0" | "1" | "2")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Normal</SelectItem>
                        <SelectItem value="1">ST-T Abnormality</SelectItem>
                        <SelectItem value="2">LV Hypertrophy</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.restecg && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.restecg.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="exang">Exercise Induced Angina</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("exang", value as "0" | "1")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.exang && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.exang.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="oldpeak">
                      ST Depression (Induced by Exercise)
                    </Label>
                    <Input
                      id="oldpeak"
                      type="number"
                      step="0.1"
                      {...register("oldpeak", { valueAsNumber: true })}
                      className="mt-2"
                      min="0"
                      max="10"
                    />
                    {errors.oldpeak && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.oldpeak.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slope">
                      Peak Exercise ST Segment Slope
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("slope", value as "0" | "1" | "2")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select slope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Upsloping</SelectItem>
                        <SelectItem value="1">Flat</SelectItem>
                        <SelectItem value="2">Downsloping</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.slope && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.slope.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ca">
                      Number of Major Vessels Colored by Fluoroscopy
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("ca", value as "0" | "1" | "2" | "3")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.ca && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.ca.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="thal">Thalassemia Result</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("thal", value as "1" | "3" | "6" | "7")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="3">Normal (Alternative)</SelectItem>
                        <SelectItem value="6">Fixed Defect</SelectItem>
                        <SelectItem value="7">Reversible Defect</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.thal && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.thal.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full h-11 text-base font-semibold"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Get Prediction
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
