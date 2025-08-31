"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { WizardStep } from "./WizardStep";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Define the form schema
const projectSchema = z.object({
  goal: z.enum(["learn", "test", "summarize", "other"]),
  goalOther: z.string().optional(),
  hasTest: z.boolean(),
  testInfo: z.string().optional(),
  testType: z.enum(["multiple_choice", "essay", "mixed", "unknown"]).optional(),
  previousMaterials: z.array(z.any()).optional(),
  studyMaterials: z.array(z.any()).optional(),
  materialLevel: z.enum(["high_school", "undergraduate", "graduate", "custom"]),
  materialLevelCustom: z.string().optional(),
  testDate: z.date().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const steps = [
  {
    id: "goal",
    title: "What is your goal?",
    description: "Tell us what you want to achieve with this project",
  },
  {
    id: "test",
    title: "Test Information",
    description: "Do you have a specific test in mind?",
  },
  {
    id: "materials",
    title: "Study Materials",
    description: "Upload your study materials",
  },
  {
    id: "level",
    title: "Material Level",
    description: "What level is this material?",
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "When is your test?",
  },
];

type DesignVariant = "modern" | "minimal" | "gradient";

interface ProjectWizardProps {
  variant?: DesignVariant;
}

export function ProjectWizard({ variant = "modern" }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      goal: undefined,
      hasTest: false,
      testType: undefined,
      materialLevel: undefined,
    },
  });

  const { handleSubmit, trigger } = methods;

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // TODO: Handle form submission
      console.log("Form data:", data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderModernDesign = () => (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-medium">{steps[currentStep].title}</span>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-[400px]"
              >
                <WizardStep
                  step={steps[currentStep]}
                  currentStep={currentStep}
                  totalSteps={steps.length}
                />
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="solid-blue"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Create Project
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="solid-blue"
              onClick={nextStep}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );

  const renderMinimalDesign = () => (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
          <p className="mt-2 text-sm text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-[400px]"
            >
              <WizardStep
                step={steps[currentStep]}
                currentStep={currentStep}
                totalSteps={steps.length}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              type="submit"
              className="px-8 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Create Project
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              className="px-8 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Next →
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );

  const renderGradientDesign = () => (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="relative mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
                {steps[currentStep].title}
              </h2>
              <p className="mt-2 text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-sm font-medium text-gray-900">
                Step {currentStep + 1}
              </span>
              <span className="text-sm text-gray-500">of {steps.length}</span>
            </div>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
        </div>

        <div className="relative mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="min-h-[400px]"
              >
                <WizardStep
                  step={steps[currentStep]}
                  currentStep={currentStep}
                  totalSteps={steps.length}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              type="submit"
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Create Project
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Next
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );

  switch (variant) {
    case "minimal":
      return renderMinimalDesign();
    case "gradient":
      return renderGradientDesign();
    default:
      return renderModernDesign();
  }
}
