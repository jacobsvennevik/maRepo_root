"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface ViolationInfo {
  url: string;
  method?: string;
  stack?: string;
  when: string;
}

export function HttpDevGuard() {
  const [violation, setViolation] = useState<ViolationInfo | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      const custom = e as CustomEvent<ViolationInfo>;
      setViolation(custom.detail);
    };
    window.addEventListener("dev-http-api-violation", handler as EventListener);

    // Install fetch guard (idempotent-ish)
    try {
      const originalFetch = window.fetch.bind(window);
      if (!(window as any).__devFetchGuardInstalled) {
        (window as any).__devFetchGuardInstalled = true;
        window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === "string" ? input : input.toString();
          const method = (init?.method || "GET").toUpperCase();
          if (!/^https?:\/\//i.test(url) && url.startsWith("/api/")) {
            const stack = new Error().stack?.toString();
            const detail: ViolationInfo = { url, method, stack, when: new Date().toISOString() };
            window.dispatchEvent(new CustomEvent("dev-http-api-violation", { detail }));
          }
          return originalFetch(input as any, init);
        }) as typeof window.fetch;
      }
    } catch {}

    // Install axios guard (all instances including default)
    try {
      if (!(axios as any).__devGuardInstalled) {
        (axios as any).__devGuardInstalled = true;
        axios.interceptors.request.use((config) => {
          const url = String(config.url ?? "");
          const method = (config.method || "GET").toUpperCase();
          if (!/^https?:\/\//i.test(url) && url.startsWith("/api/")) {
            const stack = new Error().stack?.toString();
            const detail: ViolationInfo = { url, method, stack, when: new Date().toISOString() };
            window.dispatchEvent(new CustomEvent("dev-http-api-violation", { detail }));
          }
          return config;
        });
      }
    } catch {}

    return () => {
      window.removeEventListener("dev-http-api-violation", handler as EventListener);
    };
  }, []);

  if (!violation) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      right: 16,
      zIndex: 99999,
      maxWidth: 560,
      background: "#111827",
      color: "#F9FAFB",
      border: "1px solid #374151",
      borderRadius: 8,
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      padding: 16,
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      fontSize: 12,
      lineHeight: 1.5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ color: "#FCA5A5" }}>Dev HTTP Guard: Browser called /api/*</strong>
        <button
          onClick={() => setViolation(null)}
          style={{ background: "transparent", color: "#9CA3AF", border: 0, cursor: "pointer" }}
          aria-label="Dismiss"
        >✕</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div><span style={{ color: "#9CA3AF" }}>Method:</span> {violation.method}</div>
        <div><span style={{ color: "#9CA3AF" }}>URL:</span> {violation.url}</div>
        <div><span style={{ color: "#9CA3AF" }}>When:</span> {violation.when}</div>
      </div>
      {violation.stack && (
        <pre style={{
          whiteSpace: "pre-wrap",
          overflow: "auto",
          background: "#0B1220",
          color: "#E5E7EB",
          padding: 8,
          borderRadius: 6,
          maxHeight: 240,
        }}>{violation.stack}
        </pre>
      )}
      <div style={{ marginTop: 8, color: "#93C5FD" }}>
        Fix: replace with axiosApi.get("/projects/.../") or axiosGeneration.get("/projects/.../").
      </div>
    </div>
  );
}


