// src/components/Auth/PasswordReset.js
import React, { useState } from "react";
import { Card, CardBody, Typography, Input, Button } from "@material-tailwind/react";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = (e) => {
    e.preventDefault();
    setMessage("If an account with that email exists, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="p-6">
          <Typography variant="h4" className="mb-4 text-center">
            Reset Password
          </Typography>
          {message && (
            <Typography color="green" className="mb-4 text-center">
              {message}
            </Typography>
          )}
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="gradient">
              Send Reset Link
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
