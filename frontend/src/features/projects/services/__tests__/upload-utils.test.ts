import { uploadFileToService, startDocumentProcessing } from "../upload-utils";
import { registerUpload } from "../cleanup-utils";

// Mock the cleanup utils
jest.mock("../cleanup-utils", () => ({
  registerUpload: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.showToast
const mockShowToast = jest.fn();
Object.defineProperty(window, "showToast", {
  value: mockShowToast,
  writable: true,
});

describe("upload-utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
    (registerUpload as jest.Mock).mockClear();
  });

  describe("uploadFileToService", () => {
    it("should upload file successfully", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: 1, filename: "test.pdf", status: "uploaded" };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadFileToService(mockFile, "course_files");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/upload/"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(registerUpload).toHaveBeenCalled();
    });

    it("should handle upload progress", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: 1, filename: "test.pdf", status: "uploaded" };
      const onProgress = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await uploadFileToService(mockFile, "course_files", onProgress);

      expect(registerUpload).toHaveBeenCalled();
    });

    it("should handle upload errors", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "Upload failed",
      });

      await expect(
        uploadFileToService(mockFile, "course_files"),
      ).rejects.toThrow("Upload failed: 400 Bad Request");
    });

    it("should handle network errors", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(
        uploadFileToService(mockFile, "course_files"),
      ).rejects.toThrow("Network error");
    });

    it("should handle abort errors", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const abortError = new Error("Upload was cancelled");
      abortError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(
        uploadFileToService(mockFile, "course_files"),
      ).rejects.toThrow("Upload was cancelled");
    });

    it("should upload different file types", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: 1, filename: "test.pdf", status: "uploaded" };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Test course files
      await uploadFileToService(mockFile, "course_files");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/upload/"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );

      // Test test files
      await uploadFileToService(mockFile, "test_files");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/upload/"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );

      // Test learning materials
      await uploadFileToService(mockFile, "learning_materials");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/upload/"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });
  });

  describe("startDocumentProcessing", () => {
    it("should start document processing successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "processing" }),
      });

      await startDocumentProcessing(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/1/process/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      );
      expect(registerUpload).toHaveBeenCalled();
    });

    it("should handle processing errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Processing failed",
      });

      await expect(startDocumentProcessing(1)).rejects.toThrow(
        "Processing failed: 500 Internal Server Error",
      );
    });

    it("should handle network errors during processing", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(startDocumentProcessing(1)).rejects.toThrow("Network error");
    });

    it("should handle abort errors during processing", async () => {
      const abortError = new Error("Processing was cancelled");
      abortError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(startDocumentProcessing(1)).rejects.toThrow(
        "Processing was cancelled",
      );
    });

    it("should handle different document IDs", async () => {
      const mockResponse = { status: "processing" };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await startDocumentProcessing(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/1/process/"),
        expect.any(Object),
      );

      await startDocumentProcessing(999);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/999/process/"),
        expect.any(Object),
      );
    });
  });

  describe("error handling edge cases", () => {
    it("should handle malformed JSON responses", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(
        uploadFileToService(mockFile, "course_files"),
      ).rejects.toThrow("Invalid JSON");
    });

    it("should handle empty file uploads", async () => {
      const mockFile = new File([""], "empty.pdf", { type: "application/pdf" });
      const mockResponse = { id: 1, filename: "empty.pdf", status: "uploaded" };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadFileToService(mockFile, "course_files");
      expect(result).toEqual(mockResponse);
    });

    it("should handle large file uploads", async () => {
      const largeContent = "x".repeat(1024 * 1024); // 1MB
      const mockFile = new File([largeContent], "large.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: 1, filename: "large.pdf", status: "uploaded" };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadFileToService(mockFile, "course_files");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("authentication headers", () => {
    it("should include authentication headers", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: 1, filename: "test.pdf", status: "uploaded" };

      // Mock localStorage for auth token
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue("mock-token"),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await uploadFileToService(mockFile, "course_files");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/documents/upload/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
          body: expect.any(FormData),
        }),
      );
    });

    it("should handle missing auth token gracefully", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const mockResponse = { id: 1, filename: "test.pdf", status: "uploaded" };

      // Mock localStorage with no token
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(null),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadFileToService(mockFile, "course_files");
      expect(result).toEqual(mockResponse);
    });
  });
});
