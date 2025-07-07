"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFileSize, formatAcceptedTypes, extensionToMimeType } from "@/utils/fileHelpers"

interface FileUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  maxFiles?: number
  required?: boolean
}

export function FileUpload({
  onUpload,
  accept = ".pdf,.docx,.txt",
  maxFiles = 5,
  required = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onUpload(newFiles)
    },
    [files, maxFiles, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, type) => {
      const mimeType = type.trim().startsWith('.') 
        ? extensionToMimeType(type.trim())
        : type.trim();
      return { ...acc, [mimeType]: [] };
    }, {}),
    maxFiles,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onUpload(newFiles)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-aqua bg-aqua/5"
            : "border-slate-200 hover:border-aqua/50",
          required && files.length === 0 && "border-red-200 bg-red-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-slate-400" />
          <div className="text-sm text-slate-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag & drop files here, or click to select files
                <br />
                <span className="text-xs text-slate-500">
                  Accepted formats: {formatAcceptedTypes(accept)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-700 truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 