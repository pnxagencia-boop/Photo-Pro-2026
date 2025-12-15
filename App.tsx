import React, { useState, useRef } from 'react';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { Configuration } from './components/Configuration';
import { ResultSection } from './components/ResultSection';
import { generatePrompt, generateEnhancedImage } from './services/promptService';
import { AppState, DEFAULT_ENHANCEMENTS, AspectRatio } from './types';

const INITIAL_STATE: AppState = {
  imageFile: null,
  imagePreviewUrl: null,
  selectedFoodType: "",
  aspectRatio: AspectRatio.STORY,
  enhancements: DEFAULT_ENHANCEMENTS,
  userDescription: "",
  isProcessing: false,
  isComplete: false,
  generatedPrompt: "",
  resultImageUrl: null,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleStart = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    updateState({ 
      imageFile: file, 
      imagePreviewUrl: previewUrl,
      // Reset result if new file
      isComplete: false,
      resultImageUrl: null
    });
  };

  const handleGenerate = async () => {
    if (!state.imageFile) return;

    // 1. Generate Prompt for UI display
    const prompt = generatePrompt(state);
    updateState({ 
      isProcessing: true, 
      generatedPrompt: prompt,
      isComplete: false
    });

    try {
      // 2. Call Real Gemini API
      const resultUrl = await generateEnhancedImage(state);
      
      updateState({
        isProcessing: false,
        isComplete: true,
        resultImageUrl: resultUrl
      });

    } catch (error) {
      console.error("Error processing image:", error);
      updateState({ isProcessing: false });
      
      // Generic error message for user
      alert("Ocorreu um erro ao processar a imagem com a IA. Verifique sua conexão ou tente outra foto.");
    }
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
      {/* Navbar Placeholder */}
      <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-sm border-b border-white/5">
         <div className="font-bold text-xl tracking-tighter">PHOTO<span className="text-primary">RUN</span></div>
         <a href="https://github.com" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors">GitHub Repo</a>
      </nav>

      {/* Main Content */}
      <main>
        <Hero onStart={handleStart} />
        
        <div ref={scrollRef} className="container mx-auto px-6 py-20">
           {/* Step 1: Upload */}
           <UploadZone 
             onFileSelect={handleFileSelect} 
             currentPreview={state.imagePreviewUrl}
           />

           {/* Step 2, 3, 4: Configuration - Only show if image is uploaded */}
           {state.imagePreviewUrl && (
             <div className="animate-fade-in-up">
               <Configuration 
                 state={state} 
                 updateState={updateState} 
                 onGenerate={handleGenerate}
               />
             </div>
           )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 text-center border-t border-white/5 mt-12">
         <p className="text-gray-600 text-sm">© 2024 Photo Run. Transformando fotos em vendas.</p>
      </footer>

      {/* Overlays */}
      <ResultSection state={state} onReset={handleReset} />
    </div>
  );
};

export default App;