"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Video, ChevronRight } from "lucide-react"

interface FeaturedBlogCardProps {
  title: string
  description: string
  date: string
  duration: string
  presenter: string
  buttonText?: string
  buttonUrl?: string
  imageUrl?: string
}

export function FeaturedBlogCard({
  title,
  description,
  date,
  duration,
  presenter,
  buttonText = "Watch Webinar",
  buttonUrl = "#",
  imageUrl = "/images/placeholders/webinar.svg"
}: FeaturedBlogCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="order-2 lg:order-1 p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <div className="bg-ocean-deep/10 p-1.5 rounded-full">
              <Video className="w-4 h-4 text-ocean-deep" />
            </div>
            <span className="ml-2 text-ocean-deep font-medium text-sm">Featured Webinar</span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-medium text-slate-900 mb-4">
            {title}
          </h3>
          <p className="text-slate-700 mb-6">
            {description}
          </p>
          <div className="flex items-center text-sm text-slate-500 mb-6">
            <span>{date}</span>
            <span className="mx-2">•</span>
            <span>{duration}</span>
            <span className="mx-2">•</span>
            <span>With {presenter}</span>
          </div>
          <div>
            <Button 
              variant="ocean"
              onClick={() => window.open(buttonUrl, '_blank')}
            >
              {buttonText}
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="order-1 lg:order-2 relative">
          <div className="aspect-[16/9] lg:h-full w-full relative overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transform transition-transform hover:scale-105 duration-700"
              priority={true}
              onError={(e) => {
                // @ts-ignore - TypeScript doesn't like this, but it works
                e.target.src = "/images/placeholders/webinar.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-deep/40 to-transparent opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white">
                <div className="w-16 h-16 bg-ocean-deep rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 