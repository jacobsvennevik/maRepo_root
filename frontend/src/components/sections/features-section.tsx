"use client"

import Image from "next/image"
import { FeatureCard } from "@/components/ui/cards/feature-card"

export function FeaturesSection() {
  // Feature data
  const features = [
    {
      id: "flashcards",
      title: "Smart Flashcards",
      description: "Our AI-powered flashcards adapt to your learning patterns, focusing on concepts you find challenging while reinforcing your knowledge of familiar topics.",
      items: [
        { text: "Automatically generates flashcards from any text" },
        { text: "Adapts to your learning pace and retention" },
        { text: "Tracks progress and identifies knowledge gaps" }
      ],
      icon: <Image src="/images/icons/book.svg" alt="Book icon" width={28} height={28} />,
      buttonText: "Try Flashcards",
      imageUrl: "/images/placeholders/flashcards.svg",
      iconBgColor: "blue-50",
      iconColor: "aqua",
      reverse: false
    },
    {
      id: "concept-maps",
      title: "Interactive Concept Maps",
      description: "Visualize connections between ideas and concepts with our interactive mapping tool, helping you understand complex relationships and build a comprehensive mental model.",
      items: [
        { text: "AI-generated concept relationships" },
        { text: "Interactive drag-and-drop interface" },
        { text: "Export and share your concept maps" }
      ],
      icon: <Image src="/images/icons/scroll.svg" alt="Scroll icon" width={28} height={28} />,
      buttonText: "Try Concept Maps",
      imageUrl: "/images/placeholders/concept-maps.svg",
      iconBgColor: "blue-50",
      iconColor: "ocean-medium",
      reverse: true
    },
    {
      id: "adaptive-tests",
      title: "Adaptive Testing",
      description: "Our adaptive testing engine adjusts question difficulty based on your performance, creating a personalized assessment that identifies knowledge gaps and reinforces learning.",
      items: [
        { text: "Questions adapt to your knowledge level" },
        { text: "Detailed performance analytics" },
        { text: "Personalized study recommendations" }
      ],
      icon: <Image src="/images/icons/flask.svg" alt="Flask icon" width={28} height={28} />,
      buttonText: "Try Adaptive Tests",
      imageUrl: "/images/placeholders/adaptive-tests.svg",
      iconBgColor: "blue-50",
      iconColor: "ocean-deep",
      reverse: false
    }
  ]

  return (
    <section id="tools" className="relative z-10 py-16 bg-[#f5f7fa]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-medium text-slate-900 mb-4">AI-Powered Learning Tools</h2>
          <p className="text-lg text-slate-700">
            Our intelligent tools adapt to your learning style, helping you study more effectively
          </p>
        </div>

        {/* Feature cards */}
        {features.map((feature, index) => (
          <FeatureCard 
            key={feature.id}
            id={feature.id}
            title={feature.title}
            description={feature.description}
            items={feature.items}
            icon={feature.icon}
            buttonText={feature.buttonText}
            imageUrl={feature.imageUrl}
            iconBgColor={feature.iconBgColor}
            iconColor={feature.iconColor}
            reverse={feature.reverse}
          />
        ))}
      </div>
    </section>
  )
} 