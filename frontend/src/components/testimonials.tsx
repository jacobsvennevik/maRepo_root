"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "This platform completely transformed how I study. The AI recommendations are spot-on, and I love the calming interface.",
    author: "Alex Johnson",
    role: "Medical Student",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "I've tried many study apps, but this one stands out. The personalized learning paths helped me ace my finals.",
    author: "Samantha Lee",
    role: "Computer Science Major",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "The ocean theme isn't just beautiful—it actually helps me focus. And the AI features are genuinely helpful, not gimmicky.",
    author: "Marcus Chen",
    role: "High School Teacher",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-blue-900 to-teal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            className="text-xl text-teal-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of students who have transformed their learning experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-blue-800/30 border-teal-800 h-full flex flex-col">
                <CardContent className="pt-6 flex-grow">
                  <p className="text-teal-50 italic">"{testimonial.quote}"</p>
                </CardContent>
                <CardFooter className="border-t border-teal-800/50 pt-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback className="bg-teal-700 text-teal-100">
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{testimonial.author}</p>
                      <p className="text-teal-200 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
