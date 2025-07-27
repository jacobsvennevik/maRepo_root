export function InlineOceanBackground() {
  // Simple fallback background
  return (
    <div 
      className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"
      style={{
        backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)'
      }}
    />
  );
}
