"use client";

import { useFormContext } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "./FileUpload";
import { DatePicker } from "./DatePicker";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface WizardStepProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
}

export function WizardStep({ step, currentStep }: WizardStepProps) {
  const { register, watch, setValue } = useFormContext();
  const currentGoal = watch("goal");
  const hasTest = watch("hasTest");

  const renderStepContent = () => {
    switch (step.id) {
      case "goal":
        return (
          <div className="space-y-6">
            <RadioGroup
              value={currentGoal}
              onValueChange={(value) => setValue("goal", value)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="learn" id="learn" />
                <Label htmlFor="learn">To learn</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="test" id="test" />
                <Label htmlFor="test">To prepare for a test</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="summarize" id="summarize" />
                <Label htmlFor="summarize">To summarize materials</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>

            {currentGoal === "other" && (
              <Input
                {...register("goalOther")}
                placeholder="Please specify your goal"
                className="mt-4"
              />
            )}
          </div>
        );

      case "test":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="yes"
                  id="hasTest-yes"
                  checked={hasTest}
                  onCheckedChange={(checked) => setValue("hasTest", checked)}
                />
                <Label htmlFor="hasTest-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="no"
                  id="hasTest-no"
                  checked={!hasTest}
                  onCheckedChange={(checked) => setValue("hasTest", !checked)}
                />
                <Label htmlFor="hasTest-no">No</Label>
              </div>
            </div>

            {hasTest && (
              <div className="space-y-4">
                <Textarea
                  {...register("testInfo")}
                  placeholder="What do you know about the test?"
                  className="min-h-[100px]"
                />

                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("testType", value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="multiple_choice"
                        id="multiple-choice"
                      />
                      <Label htmlFor="multiple-choice">Multiple Choice</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="essay" id="essay" />
                      <Label htmlFor="essay">Essay</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mixed Format</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="unknown" id="unknown" />
                      <Label htmlFor="unknown">Don't know</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
        );

      case "materials":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Previous Test Materials (Optional)</Label>
                <FileUpload
                  onUpload={(files) => setValue("previousMaterials", files)}
                  accept=".pdf,.docx,.txt"
                  maxFiles={5}
                />
              </div>

              <div>
                <Label>Current Study Materials</Label>
                <FileUpload
                  onUpload={(files) => setValue("studyMaterials", files)}
                  accept=".pdf,.docx,.txt"
                  maxFiles={10}
                  required
                />
              </div>
            </div>
          </div>
        );

      case "level":
        return (
          <div className="space-y-6">
            <RadioGroup
              onValueChange={(value) => setValue("materialLevel", value)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="high_school" id="high-school" />
                <Label htmlFor="high-school">High School</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="undergraduate" id="undergraduate" />
                <Label htmlFor="undergraduate">Undergraduate</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="graduate" id="graduate" />
                <Label htmlFor="graduate">Graduate</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom</Label>
              </div>
            </RadioGroup>

            {watch("materialLevel") === "custom" && (
              <Input
                {...register("materialLevelCustom")}
                placeholder="Please specify the level"
                className="mt-4"
              />
            )}
          </div>
        );

      case "timeline":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>When is your test?</Label>
              <DatePicker
                onSelect={(date) => setValue("testDate", date)}
                placeholder="Select a date"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{step.title}</h2>
        <p className="text-slate-600">{step.description}</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        {renderStepContent()}
      </div>
    </div>
  );
}
