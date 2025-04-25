"use client"

export function ColorTest() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Color Test</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-aqua text-white rounded-md">
          bg-aqua (Turquoise)
        </div>
        
        <div className="p-4 bg-ocean text-white rounded-md">
          bg-ocean (Blue)
        </div>
        
        <div className="p-4 bg-aqua-dark text-white rounded-md">
          bg-aqua-dark (Dark Turquoise)
        </div>
        
        <div className="p-4 border-2 border-aqua rounded-md">
          border-aqua
        </div>
        
        <div className="p-4 text-aqua font-bold rounded-md">
          text-aqua
        </div>
        
        <div className="p-4 text-ocean font-bold rounded-md">
          text-ocean
        </div>
      </div>
    </div>
  )
} 