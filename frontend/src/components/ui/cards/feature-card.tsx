"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface FeatureItem {
  text: string
}

interface FeatureCardProps {
  title: string
  description: string
  items: FeatureItem[]
  icon: ReactNode
  buttonText: string
  imageUrl: string
  iconBgColor: string
  iconColor: string
  reverse?: boolean
  id?: string
}

export function FeatureCard({
  title,
  description,
  items,
  icon,
  buttonText,
  imageUrl,
  iconBgColor,
  iconColor,
  reverse = false,
  id
}: FeatureCardProps) {
  return (
    <div
      id={id}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-24 min-h-[85vh] pt-16"
    >
      <div className={`max-w-lg ${reverse ? "lg:col-start-9 lg:col-end-13 pl-0 lg:pl-6" : "pr-0 lg:pr-6 lg:col-span-4"}`}>
        <div className={`bg-[#e0f7ff] p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
          {icon}
        </div>
        <h3 className="text-2xl font-medium text-slate-900 mb-4">{title}</h3>
        <p className="text-base text-slate-700 mb-6">{description}</p>
        <ul className="space-y-5 mb-8">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <div className={`bg-[#e0f7ff] p-2 rounded-full mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center`}>
                <Image 
                  src="/images/icons/checkmark.svg" 
                  alt="Checkmark" 
                  width={16} 
                  height={16} 
                />
              </div>
              <span className="text-slate-700 text-base">{item.text}</span>
            </li>
          ))}
        </ul>
        <Button 
          variant="custom-aqua"
          className="bg-[#47B5FF] hover:bg-[#47B5FF]/90 text-white px-8 py-6 rounded-lg text-base font-medium shadow-sm"
        >
          {buttonText}
        </Button>
      </div>
      <div className={`bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-102 ${
        reverse ? "lg:col-start-1 lg:col-end-9 order-1" : "lg:col-span-8 order-2"
      }`}>
        <div className={`aspect-[16/10] relative bg-gradient-to-r from-gray-50 to-gray-100`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={imageUrl || "/images/placeholders/feature.svg"}
              alt={title}
              width={900}
              height={600}
              className="rounded-lg shadow-md w-full h-auto"
              priority={true}
              onError={(e) => {
                // @ts-ignore - TypeScript doesn't like this, but it works
                e.target.src = "/images/placeholders/feature.svg";
              }}
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-base text-slate-900">{title} Interface</h4>
            <span className="text-xs bg-[#e0f7ff] text-[#47B5FF] px-3 py-1.5 rounded-full">
              Live Demo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 