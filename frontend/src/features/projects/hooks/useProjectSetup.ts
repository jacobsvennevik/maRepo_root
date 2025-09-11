'use client';

import { useState } from "react";
import { ProjectSetup } from "../types";

export const useProjectSetup = (initialSetup: ProjectSetup) => {
  const [setup, setSetup] = useState<ProjectSetup>(initialSetup);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleOptionSelect = (
    field: keyof ProjectSetup,
    value: string | string[],
  ) => {
    setSetup((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleEvaluationTypeToggle = (evaluationType: string) => {
    setSetup((prev) => ({
      ...prev,
      evaluationTypes: prev.evaluationTypes.includes(evaluationType)
        ? prev.evaluationTypes.filter((type) => type !== evaluationType)
        : [...prev.evaluationTypes, evaluationType],
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddDate = (newDate: {
    date: string;
    description: string;
    type: string;
  }) => {
    if (newDate.date && newDate.description) {
      setSetup((prev) => ({
        ...prev,
        importantDates: [...prev.importantDates, { ...newDate }],
      }));
      setHasUnsavedChanges(true);
      return true;
    }
    return false;
  };

  const handleRemoveDate = (index: number) => {
    setSetup((prev) => ({
      ...prev,
      importantDates: prev.importantDates.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (files: File[]) => {
    setSetup((prev) => ({
      ...prev,
      uploadedFiles: [...(prev.uploadedFiles || []), ...files],
    }));
    setHasUnsavedChanges(true);
  };

  const handleCourseFileUpload = (files: File[]) => {
    setSetup((prev) => ({
      ...prev,
      courseFiles: [...(prev.courseFiles || []), ...files],
    }));
    setHasUnsavedChanges(true);
  };

  const handleTestFileUpload = (files: File[]) => {
    setSetup((prev) => ({
      ...prev,
      testFiles: [...(prev.testFiles || []), ...files],
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveFile = (index: number) => {
    setSetup((prev) => ({
      ...prev,
      uploadedFiles: (prev.uploadedFiles || []).filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveCourseFile = (index: number) => {
    setSetup((prev) => ({
      ...prev,
      courseFiles: (prev.courseFiles || []).filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveTestFile = (index: number) => {
    setSetup((prev) => ({
      ...prev,
      testFiles: prev.testFiles.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAITopics = (topics: string[]) => {
    const currentDesc = setup.assignmentDescription || "";
    const topicsText = topics.join(", ");
    const newDesc = currentDesc
      ? `${currentDesc}\n\nDetected topics: ${topicsText}`
      : `Detected topics: ${topicsText}`;
    setSetup((prev) => ({ ...prev, assignmentDescription: newDesc }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAIDates = (dates: any[]) => {
    const convertedDates = dates.map((date) => ({
      date: date.date,
      description: date.description,
      type: date.type,
    }));
    setSetup((prev) => ({
      ...prev,
      importantDates: [...prev.importantDates, ...convertedDates],
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAITestTypes = (types: string[]) => {
    const convertedTypes = types
      .map((type) => {
        switch (type.toLowerCase()) {
          case "multiple choice":
            return "exams";
          case "essay":
            return "essays";
          case "problem solving":
            return "exams";
          case "lab practical":
            return "labs";
          case "oral exam":
            return "presentations";
          case "take-home":
            return "projects";
          default:
            return "exams";
        }
      })
      .filter((type, index, self) => self.indexOf(type) === index);

    setSetup((prev) => ({
      ...prev,
      evaluationTypes: [
        ...new Set([...prev.evaluationTypes, ...convertedTypes]),
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAIRecommendations = (recommendations: any[]) => {
    setSetup((prev) => {
      const newSetup = { ...prev };
      let hasChanged = false;
      recommendations.forEach((rec) => {
        switch (rec.type) {
          case "schedule":
            if (!newSetup.studyFrequency) {
              newSetup.studyFrequency = "daily";
              hasChanged = true;
            }
            break;
          case "material":
            const materialNote = `\n\nStudy Materials: ${rec.description}`;
            newSetup.assignmentDescription =
              (newSetup.assignmentDescription || "") + materialNote;
            hasChanged = true;
            break;
          case "strategy":
            const strategyNote = `\n\nTest Strategy: ${rec.description}`;
            newSetup.goal = (newSetup.goal || "") + strategyNote;
            hasChanged = true;
            break;
          case "timeline":
            if (!newSetup.timeframe) {
              newSetup.timeframe = "3-months";
              hasChanged = true;
            }
            break;
        }
      });
      if (hasChanged) {
        setHasUnsavedChanges(true);
      }
      return newSetup;
    });
  };

  return {
    setup,
    setSetup,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    handleOptionSelect,
    handleEvaluationTypeToggle,
    handleAddDate,
    handleRemoveDate,
    handleFileUpload,
    handleCourseFileUpload,
    handleTestFileUpload,
    handleRemoveFile,
    handleRemoveCourseFile,
    handleRemoveTestFile,
    handleApplyAITopics,
    handleApplyAIDates,
    handleApplyAITestTypes,
    handleApplyAIRecommendations,
  };
};
