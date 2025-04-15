"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, BookOpen, MessageCircle, Video, FileText } from "lucide-react"

// Blog post type definition
type BlogPost = {
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

// Sample blog posts data
const blogPosts: BlogPost[] = [
  {
    id: "1",
    category: "Learning Science",
    type: "article",
    title: "The Science of Memory Retention in Digital Learning",
    description:
      "Explore the latest research on how spaced repetition and active recall techniques can dramatically improve knowledge retention when studying complex topics.",
    image: "/placeholder.svg?height=600&width=800",
    date: "April 10, 2023",
    author: "Dr. Emma Waters",
    readTime: "8 min read",
  },
  {
    id: "2",
    category: "AI Education",
    type: "video",
    title: "How AI is Transforming Personalized Learning Paths",
    description:
      "Our lead AI researcher demonstrates how machine learning algorithms analyze learning patterns to create truly personalized study experiences.",
    image: "/placeholder.svg?height=600&width=800",
    date: "March 22, 2023",
    author: "Prof. James Chen",
    readTime: "12 min watch",
  },
  {
    id: "3",
    category: "Case Study",
    type: "case-study",
    title: "University Success Story: 40% Improvement in Student Engagement",
    description:
      "Learn how Pacific Coast University implemented our adaptive learning platform and saw dramatic improvements in student performance and satisfaction.",
    image: "/placeholder.svg?height=600&width=800",
    date: "February 15, 2023",
    author: "Sarah Johnson",
    readTime: "6 min read",
  },
  {
    id: "4",
    category: "Tutorial",
    type: "tutorial",
    title: "Creating Effective Concept Maps for Complex Subjects",
    description:
      "A step-by-step guide to using our concept mapping tools to visualize relationships between ideas and enhance understanding of difficult topics.",
    image: "/placeholder.svg?height=600&width=800",
    date: "January 30, 2023",
    author: "Michael Torres",
    readTime: "10 min read",
  },
]

// Category filter options
const categories = ["All Categories", "Learning Science", "AI Education", "Case Study", "Tutorial"]

// Content type filter options
const contentTypes = ["All Types", "Articles", "Videos", "Tutorials", "Case Studies"]

export function BlogResourcesSection() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedType, setSelectedType] = useState("All Types")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  // Get icon based on post type
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

  return (
    <section id="resources" className="relative py-20 overflow-hidden">
      {/* Ocean-inspired background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/images/ocean-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-deep/10 via-aqua/5 to-ocean-medium/10" />
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block bg-ocean-medium/10 px-4 py-2 rounded-full text-ocean-deep font-medium mb-4">
            Resources & Insights
          </div>
          <h2 className="text-4xl font-medium text-slate-900 mb-4">Dive Deeper Into Learning</h2>
          <p className="text-lg text-slate-700">
            Explore our collection of articles, videos, and case studies about effective learning strategies, AI in
            education, and success stories from our community.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <h3 className="text-xl font-medium text-slate-900">Latest Resources</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center justify-between w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light"
              >
                <span className="text-slate-700">{selectedCategory}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                  <ul className="py-1">
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => {
                            setSelectedCategory(category)
                            setShowCategoryDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2 hover:bg-slate-50 ${
                            selectedCategory === category ? "text-ocean-medium font-medium" : "text-slate-700"
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Content type filter */}
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center justify-between w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light"
              >
                <span className="text-slate-700">{selectedType}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showTypeDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                  <ul className="py-1">
                    {contentTypes.map((type) => (
                      <li key={type}>
                        <button
                          onClick={() => {
                            setSelectedType(type)
                            setShowTypeDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2 hover:bg-slate-50 ${
                            selectedType === type ? "text-ocean-medium font-medium" : "text-slate-700"
                          }`}
                        >
                          {type}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured post */}
        <div className="mb-16">
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
                  The Future of AI-Powered Learning: Trends and Predictions
                </h3>
                <p className="text-slate-700 mb-6">
                  Join our panel of education experts and AI researchers as they discuss emerging trends in educational
                  technology and predict how artificial intelligence will transform learning experiences over the next
                  decade.
                </p>
                <div className="flex items-center text-sm text-slate-500 mb-6">
                  <span>April 15, 2023</span>
                  <span className="mx-2">•</span>
                  <span>60 min webinar</span>
                  <span className="mx-2">•</span>
                  <span>With Dr. Maya Patel</span>
                </div>
                <div>
                  <Button className="bg-ocean-deep hover:bg-blue-900 text-white flex items-center">
                    Watch Webinar
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="aspect-[16/9] lg:h-full w-full relative overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=800&width=1200"
                    alt="The Future of AI-Powered Learning"
                    fill
                    className="object-cover transform transition-transform hover:scale-105 duration-700"
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
        </div>

        {/* Blog posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full transform transition-transform hover:scale-105 duration-500"
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
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <Button variant="outline" className="border-ocean-medium text-ocean-deep hover:bg-ocean-medium/10">
            View All Resources
          </Button>
        </div>
      </div>
    </section>
  )
}
