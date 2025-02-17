// src/components/Home.js
import React from "react";
import { Typography } from "@material-tailwind/react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Typography variant="h3" color="blue-gray">
        Welcome to the Home Page!
      </Typography>
    </div>
  );
}