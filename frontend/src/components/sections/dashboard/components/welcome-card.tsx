"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";

interface WelcomeCardProps {
  userName: string;
}

export function WelcomeCard({ userName }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-sm border-0 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="lg:col-span-8 p-8">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-medium text-white">
              Good evening, {userName}
            </CardTitle>
            <CardDescription className="text-base text-emerald-50 mt-2">
              Need help? Tell me a little about yourself so I can make the best recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Button 
              variant="custom-aqua"
              className="bg-white hover:bg-emerald-50 text-emerald-600 px-6 py-5 mt-4 rounded-lg font-medium shadow-sm flex items-center"
            >
              <MessageSquareText className="mr-2 h-5 w-5" />
              Start a conversation
            </Button>
          </CardContent>
        </div>
        <div className="lg:col-span-4 bg-emerald-700/20 h-full p-8 hidden lg:block relative">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-400/30 rounded-full"></div>
          <div className="absolute -right-5 -top-20 w-40 h-40 bg-emerald-300/20 rounded-full"></div>
          <div className="aspect-square relative z-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/dashboard/welcome-illustration.svg"
                alt="Welcome illustration"
                className="w-full h-auto"
                onError={(e) => {
                  // @ts-ignore
                  e.target.src = "/placeholder.svg?height=200&width=200";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 