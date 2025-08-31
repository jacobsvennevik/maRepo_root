/**
 * File utility functions for handling file operations, size formatting, and validation
 */

/**
 * Formats file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates if a file type is accepted based on accept string
 */
export function validateFileType(file: File, acceptedTypes: string[]): boolean {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  return acceptedTypes.some((type) => {
    const trimmedType = type.trim();
    if (trimmedType.startsWith(".")) {
      // Extension-based validation
      return fileName.endsWith(trimmedType.toLowerCase());
    } else {
      // MIME type validation
      return fileType === trimmedType;
    }
  });
}

/**
 * Converts file extensions to MIME types
 */
export function extensionToMimeType(extension: string): string {
  const mimeTypeMap: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".doc": "application/msword",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return mimeTypeMap[extension.toLowerCase()] || extension;
}

/**
 * Formats accepted file types for display
 */
export function formatAcceptedTypes(accept: string): string {
  return accept
    .split(",")
    .map((type) => {
      const format = type.trim();
      if (format === "application/pdf") return "PDF";
      if (
        format ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
        return "DOCX";
      if (format === "text/plain") return "TXT";
      if (format.startsWith(".")) return format.slice(1).toUpperCase();
      return format.toUpperCase();
    })
    .join(", ");
}

/**
 * Validates file size against maximum allowed size
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Gets upload status based on progress value
 */
export function getUploadStatus(
  fileName: string,
  uploadProgress: Record<string, number>,
): "uploading" | "error" | "success" | "idle" {
  const progress = uploadProgress[fileName];
  if (progress === undefined) return "idle";
  if (progress === -1) return "error";
  if (progress === 100) return "success";
  return "uploading";
}
