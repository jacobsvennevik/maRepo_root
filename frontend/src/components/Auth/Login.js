// src/components/Auth/Login.js
import React from "react";
import { Card, CardBody, Typography, Input, Button } from "@material-tailwind/react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="p-6">
          <Typography variant="h4" className="mb-4 text-center">
            Login
          </Typography>
          <form className="flex flex-col gap-4">
            <Input label="Email or Username" type="text" required />
            <Input label="Password" type="password" required />
            <Button type="submit" variant="gradient">
              Login
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
