// src/components/Layout.js
import React from "react";
import Navbar from "./Navbar/Navbar"; // Ensure the path matches your structure
import Footer from "./Landing/Footer"; // Similarly, check this path

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
