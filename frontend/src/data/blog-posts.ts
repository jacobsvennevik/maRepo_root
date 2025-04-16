import { BlogPost } from "@/components/ui/cards/blog-card"

// Sample blog posts data
export const blogPosts: BlogPost[] = [
  {
    id: "1",
    category: "Learning Science",
    type: "article",
    title: "The Science of Memory Retention in Digital Learning",
    description:
      "Explore the latest research on how spaced repetition and active recall techniques can dramatically improve knowledge retention when studying complex topics.",
    image: "/images/placeholders/article.svg",
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
    image: "/images/placeholders/article.svg",
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
    image: "/images/placeholders/article.svg",
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
    image: "/images/placeholders/article.svg",
    date: "January 30, 2023",
    author: "Michael Torres",
    readTime: "10 min read",
  },
]

// Featured blog post data
export const featuredBlogPost = {
  title: "The Future of AI-Powered Learning: Trends and Predictions",
  description: "Join our panel of education experts and AI researchers as they discuss emerging trends in educational technology and predict how artificial intelligence will transform learning experiences over the next decade.",
  date: "April 15, 2023",
  duration: "60 min webinar",
  presenter: "Dr. Maya Patel",
  imageUrl: "/images/placeholders/webinar.svg"
}

// Category filter options
export const categories = ["All Categories", "Learning Science", "AI Education", "Case Study", "Tutorial"]

// Content type filter options
export const contentTypes = ["All Types", "Articles", "Videos", "Tutorials", "Case Studies"] 