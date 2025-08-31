"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSetup } from "../types";
import { ProjectSummary } from "./project-summary";
import {
  ProjectSummaryColorful,
  ProjectSummaryGlass,
  ProjectSummaryGameified,
} from "./project-summary-variants";
import { Palette, Sparkles, Gamepad2, Monitor, Eye } from "lucide-react";

// Demo component to showcase different variants
export function ProjectSummaryDemo({
  setup,
  onBack,
}: {
  setup: ProjectSetup;
  onBack: () => void;
}) {
  const [currentVariant, setCurrentVariant] = useState("original");

  const variants = [
    {
      id: "original",
      name: "Original",
      description: "Clean and professional design",
      icon: Monitor,
      component: ProjectSummary,
      color: "bg-blue-500",
    },
    {
      id: "colorful",
      name: "Colorful Dashboard",
      description: "Vibrant with animated elements",
      icon: Palette,
      component: ProjectSummaryColorful,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "glass",
      name: "Glass Morphism",
      description: "Modern glass effect with dark theme",
      icon: Sparkles,
      component: ProjectSummaryGlass,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
    },
    {
      id: "gamified",
      name: "Gamified",
      description: "RPG-style with achievements and levels",
      icon: Gamepad2,
      component: ProjectSummaryGameified,
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
    },
  ];

  const CurrentComponent =
    variants.find((v) => v.id === currentVariant)?.component || ProjectSummary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Variant Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Eye className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Design Preview
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              {variants.map((variant) => {
                const Icon = variant.icon;
                return (
                  <Button
                    key={variant.id}
                    variant={
                      currentVariant === variant.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setCurrentVariant(variant.id)}
                    className={`flex items-center space-x-2 ${
                      currentVariant === variant.id
                        ? `${variant.color} text-white hover:opacity-90`
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{variant.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Current Variant Info */}
          <div className="pb-4">
            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="flex items-center space-x-1"
              >
                {(() => {
                  const currentVar = variants.find(
                    (v) => v.id === currentVariant,
                  );
                  const Icon = currentVar?.icon || Monitor;
                  return <Icon className="h-3 w-3" />;
                })()}
                <span>
                  {variants.find((v) => v.id === currentVariant)?.name}
                </span>
              </Badge>
              <span className="text-sm text-gray-600">
                {variants.find((v) => v.id === currentVariant)?.description}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Current Variant */}
      <CurrentComponent setup={setup} onBack={onBack} />
    </div>
  );
}

// Usage instructions component
export function VariantUsageGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Project Summary Variants
      </h1>

      <div className="prose prose-lg text-gray-600 mb-8">
        <p>
          Here are 4 different design approaches for the project summary
          component, each with its own personality and use case:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            name: "Original",
            description:
              "Clean, professional design with good information hierarchy",
            useCase:
              "Perfect for academic institutions and professional environments",
            features: [
              "Clean typography",
              "Organized cards",
              "Professional colors",
              "Clear structure",
            ],
            preview: "bg-gradient-to-br from-blue-50 to-indigo-50",
          },
          {
            name: "Colorful Dashboard",
            description:
              "Vibrant, energetic design with animations and bright gradients",
            useCase: "Great for younger audiences and creative subjects",
            features: [
              "Animated elements",
              "Bright color scheme",
              "Visual hierarchy",
              "Engaging interactions",
            ],
            preview: "bg-gradient-to-br from-purple-50 to-pink-50",
          },
          {
            name: "Glass Morphism",
            description:
              "Modern dark theme with glass effects and floating elements",
            useCase: "Appeals to tech-savvy users and modern applications",
            features: [
              "Glass blur effects",
              "Dark theme",
              "Floating animations",
              "Premium feel",
            ],
            preview: "bg-gradient-to-br from-indigo-900 to-purple-900",
          },
          {
            name: "Gamified",
            description:
              "RPG-style interface with levels, achievements, and progress bars",
            useCase: "Perfect for making learning fun and engaging",
            features: [
              "Achievement system",
              "Progress tracking",
              "RPG aesthetics",
              "Motivation focus",
            ],
            preview: "bg-gradient-to-br from-slate-800 to-purple-900",
          },
        ].map((variant, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className={`h-32 ${variant.preview} relative`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{variant.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{variant.description}</p>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Best for:</h4>
                <p className="text-sm text-gray-600">{variant.useCase}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Key Features:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {variant.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            1. Import the variant you want to use from
            `./project-summary-variants`
          </p>
          <p>
            2. Replace the `ProjectSummary` component with your chosen variant
          </p>
          <p>3. All variants accept the same props: `setup` and `onBack`</p>
          <p>4. Customize colors and styling to match your brand</p>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg">
          <code className="text-sm text-gray-800">
            {`import { ProjectSummaryColorful } from './project-summary-variants';

// Replace ProjectSummary with your chosen variant
<ProjectSummaryColorful setup={setup} onBack={onBack} />`}
          </code>
        </div>
      </div>
    </div>
  );
}
