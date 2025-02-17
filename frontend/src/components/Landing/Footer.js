import React from "react";
import { Typography } from "@material-tailwind/react";

export default function Footer() {
  return (
    <footer className="bg-white py-6 border-t border-blue-gray-50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <Typography color="blue-gray" className="font-normal">
          &copy; 2025 AI Study Assistant. All Rights Reserved.
        </Typography>
        <ul className="flex flex-wrap items-center gap-x-6">
          <li>
            <Typography
              as="a"
              href="#about"
              color="blue-gray"
              className="transition-colors hover:text-blue-500"
            >
              About Us
            </Typography>
          </li>
          <li>
            <Typography
              as="a"
              href="#privacy"
              color="blue-gray"
              className="transition-colors hover:text-blue-500"
            >
              Privacy Policy
            </Typography>
          </li>
          <li>
            <Typography
              as="a"
              href="#contact"
              color="blue-gray"
              className="transition-colors hover:text-blue-500"
            >
              Contact
            </Typography>
          </li>
        </ul>
      </div>
    </footer>
  );
}
