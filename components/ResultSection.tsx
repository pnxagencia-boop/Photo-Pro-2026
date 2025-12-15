import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AspectRatio } from '../types';

interface ResultSectionProps {
  state: AppState;
  onReset: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ state, onReset }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate progress bar during processing
  useEffect(() => {
    if (state.isProcessing) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (state.isComplete) {
      setLoadingProgress(100);
      setSliderPosition(50); // Reset slider to center
    }
  }, [state.isProcessing, state.isComplete]);

  // Comparison Slider Logic
  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  // Global event listeners for dragging outside container
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);


  // Helper to get aspect ratio class
  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case AspectRatio.SQUARE: return 'aspect-square max-w-[500px]';
      case AspectRatio.PORTRAIT: return 'aspect-[4/5] max-w-[450px]';
      case AspectRatio.STORY: return 'aspect-[9/16] max-w-[350px]';
      case AspectRatio.LANDSCAPE: return 'aspect-video max-w-[700px]';
      default: return 'aspect-[4/5] max-w-[450px]';
    }
  };

  if (!state.isProcessing && !state.isComplete) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 overflow-y-auto">
      
      {state.isProcessing ? (
        <div className="w-full max-w-md text-center space-y-8 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Processando...</h3>
            <p className="text-gray-400">Estamos criando uma imagem que vende.</p>
          </div>

          <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-600 font-mono">
            Gerando prompt de IA...
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center py-8 animate-fade-in-up">
          
          {/* Header */}
          <div className="w-full max-w-4xl flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Resultado Profissional</h2>
            <button 
              onClick={onReset}
              className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              Fechar
            </button>
          </div>

          {/* Comparison Slider Area */}
          <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 mb-8">
            <div 
              ref={containerRef}
              className={`relative w-full ${getAspectRatioClass(state.aspectRatio)} rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,106,0,0.1)] bg-surface border border-gray-800 select-none cursor-ew-resize`}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={handleMouseDown}
            >
              
              {/* Layer 1: Edited Image (Background - Shows on Right) */}
              <img 
                src={state.resultImageUrl || ''} 
                alt="Depois" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              
              {/* Label: Depois */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-bold text-primary uppercase z-10 pointer-events-none">
                Depois
              </div>

              {/* Layer 2: Original Image (Foreground - Shows on Left based on width) */}
              <div 
                className="absolute inset-0 h-full overflow-hidden border-r-2 border-primary/80 bg-surface"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={state.imagePreviewUrl || ''} 
                  alt="Antes" 
                  className="absolute top-0 left-0 w-full h-full object-cover max-w-none pointer-events-none" 
                  style={{ width: containerRef.current?.offsetWidth }} // Keep width fixed to container width to align pixels
                />
                 {/* Label: Antes */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white uppercase z-10 pointer-events-none">
                  Original
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute inset-y-0 w-10 -ml-5 flex items-center justify-center z-20 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-primary shadow-lg border-2 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M8 17h8" /> 
                    {/* Simple grip icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6" />
                  </svg>
                </div>
              </div>

              {/* Flash effect on load */}
              <div className="absolute inset-0 bg-white opacity-0 animate-[flash_1s_ease-out_1] pointer-events-none"></div>
            </div>
            
            <p className="mt-4 text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Arraste para comparar
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-4xl">
            <a 
              href={state.resultImageUrl || '#'} 
              download={`photorun-${Date.now()}.jpg`}
              className="w-full md:w-auto px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Baixar Imagem Profissional
            </a>
             <button 
              onClick={onReset}
              className="w-full md:w-auto px-8 py-4 bg-transparent border border-gray-700 text-gray-300 font-bold rounded-full hover:border-white hover:text-white transition-all"
            >
              Processar Outra Foto
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
};