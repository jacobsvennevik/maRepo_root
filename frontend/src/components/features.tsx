"use client"

import { motion } from "framer-motion"
import { Brain, BookOpen, Clock, Target, Sparkles, Compass } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: <Brain className="h-10 w-10 text-teal-400" />,
    title: "AI-Powered Learning",
    description:
      "Our platform adapts to your learning style and pace, creating personalized study plans that evolve as you progress.",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-teal-400" />,
    title: "Comprehensive Library",
    description:
      "Access thousands of study materials across various subjects, all organized for efficient learning and retention.",
  },
  {
    icon: <Clock className="h-10 w-10 text-teal-400" />,
    title: "Time Optimization",
    description:
      "Smart scheduling algorithms help you make the most of your study time, focusing on what matters most.",
  },
  {
    icon: <Target className="h-10 w-10 text-teal-400" />,
    title: "Goal Tracking",
    description: "Set and monitor your learning objectives with detailed analytics and progress visualization.",
  },
  {
    icon: <Sparkles className="h-10 w-10 text-teal-400" />,
    title: "Interactive Exercises",
    description: "Engage with dynamic content that makes learning active and memorable, not just passive reading.",
  },
  {
    icon: <Compass className="h-10 w-10 text-teal-400" />,
    title: "Learning Pathways",
    description: "Follow curated learning journeys or create your own custom path to knowledge mastery.",
  },
]

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-blue-950 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Dive Deeper with Our Features
          </motion.h2>
          <motion.p
            className="text-xl text-teal-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover how our platform transforms studying from a chore into an engaging journey of discovery.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-blue-900/50 border-blue-800 hover:bg-blue-800/50 transition-colors duration-300 h-full">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-teal-100 text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
