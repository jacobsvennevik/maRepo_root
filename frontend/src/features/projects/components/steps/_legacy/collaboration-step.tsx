// LEGACY COMPONENT - DO NOT IMPORT
// This component has been deprecated and moved to legacy
// Use the new simplified wizard flow instead
export default function LegacyStepGuard() {
  if (process.env.NODE_ENV !== "production") {
    throw new Error("Legacy step imported by mistake. Use the new simplified wizard flow instead.");
  }
  return null;
}
