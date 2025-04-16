"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, BookOpen, MessageCircle, Video, FileText } from "lucide-react"

// Blog post type definition
export type BlogPost = {
  id: string
  category: string
  type: "article" | "video" | "tutorial" | "case-study"
  title: string
  description: string
  image: string
  date: string
  author: string
  readTime?: string
}

// Helper function to get icon based on post type
const getPostIcon = (type: string) => {
  switch (type) {
    case "article":
      return <FileText className="w-5 h-5 text-ocean-medium" />
    case "video":
      return <Video className="w-5 h-5 text-ocean-medium" />
    case "tutorial":
      return <BookOpen className="w-5 h-5 text-ocean-medium" />
    case "case-study":
      return <MessageCircle className="w-5 h-5 text-ocean-medium" />
    default:
      return <FileText className="w-5 h-5 text-ocean-medium" />
  }
}

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative">
        <div className="aspect-[16/10] relative overflow-hidden">
          <Image
            src={post.image || "/images/placeholders/article.svg"}
            alt={post.title}
            width={800}
            height={600}
            className="object-cover w-full h-full transform transition-transform hover:scale-105 duration-500"
            priority={true}
            onError={(e) => {
              // @ts-ignore - TypeScript doesn't like this, but it works
              e.target.src = "/images/placeholders/article.svg";
            }}
          />
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center">
          {getPostIcon(post.type)}
          <span className="ml-1.5 text-sm font-medium text-slate-700">{post.category}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-medium text-slate-900 mb-3 line-clamp-2">{post.title}</h3>
        <p className="text-slate-600 mb-4 line-clamp-3">{post.description}</p>
        <div className="flex items-center text-sm text-slate-500 mb-4">
          <span>{post.date}</span>
          <span className="mx-2">•</span>
          <span>{post.readTime}</span>
        </div>
        <Link
          href={`/blog/${post.id}`}
          className="inline-flex items-center text-ocean-medium hover:text-ocean-deep font-medium"
        >
          Read more
          <ChevronRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
    </div>
  )
} 