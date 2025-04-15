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
        <div className={`bg-${iconBgColor} p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6`}>
          {icon}
        </div>
        <h3 className="text-2xl font-medium text-slate-900 mb-4">{title}</h3>
        <p className="text-base text-slate-700 mb-6">{description}</p>
        <ul className="space-y-3 mb-8">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <div className={`bg-${iconBgColor} p-1 rounded-full mr-3 mt-1`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className={`w-4 h-4 text-${iconColor}`}
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-slate-700">{item.text}</span>
            </li>
          ))}
        </ul>
        <Button className={`bg-${iconColor} hover:bg-${iconColor === "aqua" ? "aqua-dark" : "ocean-deep"} text-white`}>
          {buttonText}
        </Button>
      </div>
      <div className={`bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-102 ${
        reverse ? "lg:col-start-1 lg:col-end-9 order-1" : "lg:col-span-8 order-2"
      }`}>
        <div className={`aspect-[16/10] relative bg-gradient-to-r from-${iconBgColor} to-${iconColor}/5`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={title}
              width={900}
              height={600}
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-base text-slate-900">{title} Interface</h4>
            <span className={`text-xs bg-${iconBgColor} text-${iconColor} px-3 py-1.5 rounded-full`}>
              Live Demo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 