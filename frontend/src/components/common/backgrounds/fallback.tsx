export function OceanBackgroundFallback() {
  return (
    <div
      className="fixed inset-0 z-0 bg-gradient-to-b from-blue-400/30 to-cyan-100/30"
      style={{
        backgroundImage: "url('/images/ocean-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-hidden="true"
    />
  );
}
