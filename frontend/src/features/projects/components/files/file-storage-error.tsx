"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface FileStorageErrorProps {
  error: string;
  onRetry: () => void;
}

export function FileStorageError({ error, onRetry }: FileStorageErrorProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load files
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={onRetry} variant="ocean">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

