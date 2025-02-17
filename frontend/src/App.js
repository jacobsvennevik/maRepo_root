import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home"; // Your home page
import Login from "./components/Auth/Login";
import PasswordReset from "./components/Auth/PasswordReset";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          {/* Additional routes */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
