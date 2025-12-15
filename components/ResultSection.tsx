import React, { useEffect, useState } from 'react';
import { AppState } from '../types';

interface ResultSectionProps {
  state: AppState;
  onReset: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ state, onReset }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

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
    }
  }, [state.isProcessing, state.isComplete]);

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
        <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Resultado Profissional</h2>
            <button 
              onClick={onReset}
              className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              Fechar / Nova Foto
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Original */}
            <div className="space-y-4">
               <span className="inline-block px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-bold uppercase tracking-wider">Original</span>
               <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-surface aspect-[4/5] flex items-center justify-center">
                 <img src={state.imagePreviewUrl || ''} alt="Original" className="max-w-full max-h-full object-contain" />
               </div>
            </div>

            {/* Result */}
            <div className="space-y-4">
               <span className="inline-block px-3 py-1 bg-primary text-black rounded text-xs font-bold uppercase tracking-wider">Photo Run AI</span>
               <div className="relative w-full rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,106,0,0.15)] bg-surface aspect-[4/5] flex items-center justify-center group">
                 <img src={state.resultImageUrl || ''} alt="Processed" className="w-full h-full object-cover" />
                 
                 {/* Flash overlay effect on load */}
                 <div className="absolute inset-0 bg-white opacity-0 animate-[flash_1s_ease-out_1]"></div>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a 
              href={state.resultImageUrl || '#'} 
              download={`photorun-${Date.now()}.jpg`}
              className="w-full md:w-auto px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
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
          
          {/* Debug Info for Developers */}
          <div className="mt-12 p-4 bg-gray-900 rounded-lg border border-gray-800">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Prompt Gerado (Simulação Backend)</h4>
             <p className="text-xs text-gray-400 font-mono leading-relaxed opacity-70">
                {state.generatedPrompt}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};