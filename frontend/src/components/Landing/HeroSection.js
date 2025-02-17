import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center py-20 bg-gray-50">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardBody className="p-8 text-center">
          <Typography variant="h2" color="blue-gray" className="mb-4 font-bold">
            Transform Your Study Sessions
          </Typography>
          <Typography variant="lead" color="gray" className="mb-8">
            Generate AI-powered flashcards, summaries, tests, and enhanced notes from your uploaded documents.
          </Typography>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button variant="gradient" size="lg">
              Get Started
            </Button>
            <Button variant="outlined" size="lg">
              Learn More
            </Button>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
