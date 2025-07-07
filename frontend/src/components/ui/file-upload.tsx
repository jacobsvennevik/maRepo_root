"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"
import { Alert, AlertDescription } from "./alert"
import { formatFileSize, formatAcceptedTypes, getUploadStatus, extensionToMimeType } from "@/utils/fileHelpers"

export interface FileUploadProps {
  onUpload: (files: File[]) => void
  onRemove?: (index: number) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  required?: boolean
  title?: string
  description?: string
  buttonText?: string
  showFileList?: boolean
  className?: string
  files?: File[]
  uploadProgress?: Record<string, number>
  error?: string
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
  maxFiles = 5,
  maxSize = 50 * 1024 * 1024, // 50MB default
  required = false,
  title = "Drag & drop files here",
  description = "or click to browse",
  buttonText = "Browse files",
  showFileList = true,
  className = "",
  files = [],
  uploadProgress = {},
  error
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map(rejection => {
          const file = rejection.file
          const error = rejection.errors[0] // Get the first error for simplicity
          switch (error.code) {
            case 'file-too-large':
              return `${file.name} is too large. Max size is ${formatFileSize(maxSize)}`
            case 'file-invalid-type':
              return `${file.name} is not a supported file type`
            case 'too-many-files':
              return `Too many files. Max allowed is ${maxFiles}`
            default:
              return `${file.name} could not be uploaded`
          }
        })
        setValidationError(errors.join('. '))
        return
      }

      // Clear any previous errors if the upload is successful
      setValidationError(null)
      const validFiles = acceptedFiles.filter(file => file.size <= maxSize)
      const newFiles = [...files, ...validFiles].slice(0, maxFiles)
      onUpload(newFiles)
    },
    [files, maxFiles, maxSize, onUpload]
  )

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, type) => {
      // Convert file extensions to MIME types if needed
      const mimeType = type.trim().startsWith('.') 
        ? {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain'
          }[type.trim()] || type.trim()
        : type.trim();
      return { ...acc, [mimeType]: [] };
    }, {}),
    maxFiles,
    maxSize,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => {
      setIsDragActive(false)
      setValidationError(null)
    },
    onDropRejected: () => {
      setIsDragActive(false)
    }
  })



  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
          isDragActive && "border-blue-400 bg-blue-50/50 scale-105",
          isDragReject && "border-red-400 bg-red-50/50",
          !isDragActive && !isDragReject && "border-gray-300 hover:border-blue-300 hover:bg-gray-50/50",
          required && files.length === 0 && "border-red-200 bg-red-50/10",
          "cursor-pointer"
        )}
      >
        <input {...getInputProps()} data-testid="file-input" />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isDragActive ? "Drop files here!" : title}
            </h3>
            <p className="text-slate-600 mb-4">
              {description}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Max size: {formatFileSize(maxSize)} • Supported formats: {formatAcceptedTypes(accept)}
            </p>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = accept;
                input.multiple = maxFiles > 1;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  onDrop(files, []);
                };
                input.click();
              }}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>

      {(error || validationError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || validationError}
          </AlertDescription>
        </Alert>
      )}

      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const status = getUploadStatus(file.name, uploadProgress)
            return (
              <div
                key={file.name}
                className={cn(
                  "flex items-center justify-between bg-slate-50 rounded-lg p-3",
                  status === 'error' && "bg-red-50",
                  status === 'success' && "bg-green-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <FileText className={cn(
                    "h-5 w-5",
                    status === 'error' && "text-red-600",
                    status === 'success' && "text-green-600",
                    status === 'uploading' && "text-blue-600",
                    status === 'idle' && "text-slate-600"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {uploadProgress[file.name] !== undefined && uploadProgress[file.name] !== -1 && (
                    <div className="w-24">
                      <Progress
                        value={uploadProgress[file.name]}
                        aria-label={`Upload progress for ${file.name}`}
                        aria-valuenow={uploadProgress[file.name]}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label={`Remove file ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 