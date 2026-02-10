
import React, { useState, useRef, useCallback } from 'react';

interface ImageSliderProps {
  before: string;
  after: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const frameId = useRef<number | null>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    if (frameId.current) cancelAnimationFrame(frameId.current);

    frameId.current = requestAnimationFrame(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setSliderPosition(percent);
    });
  }, []);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    updatePosition(clientX);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video overflow-hidden rounded-[40px] border border-slate-200 shadow-2xl cursor-col-resize select-none bg-slate-100"
      onMouseDown={() => { isDragging.current = true; }}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onMouseMove={handleMove}
      onTouchStart={() => { isDragging.current = true; }}
      onTouchEnd={() => { isDragging.current = false; }}
      onTouchMove={handleMove}
    >
      {/* After Image (Full Background) */}
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
        loading="eager"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-none"
        style={{ width: `${sliderPosition}%`, borderRight: '2px solid white' }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
          loading="eager"
        />
      </div>

      {/* Handle */}
      <div 
        className="absolute inset-y-0 pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 20px)` }}
      >
        <div className="h-full flex items-center justify-center w-10">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-900/5 transition-transform hover:scale-110 active:scale-90">
             <div className="flex gap-1">
                <div className="w-1 h-3 bg-slate-300 rounded-full"></div>
                <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-3 bg-slate-300 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-6 left-6 bg-slate-900/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black text-white border border-white/20">
        Original
      </div>
      <div className="absolute top-6 right-6 bg-indigo-600/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black text-white border border-white/20">
        Renderizado
      </div>
    </div>
  );
};

export default ImageSlider;
