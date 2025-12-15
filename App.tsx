import React, { useState, useRef } from 'react';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { Configuration } from './components/Configuration';
import { ResultSection } from './components/ResultSection';
import { PaymentModal } from './components/PaymentModal';
import { generatePrompt, generateEnhancedImage, refineImage } from './services/promptService';
import { validatePaymentProof } from './services/paymentService';
import { AppState, DEFAULT_ENHANCEMENTS, AspectRatio, PaymentStatus } from './types';

const INITIAL_STATE: AppState = {
  imageFile: null,
  imagePreviewUrl: null,
  selectedFoodType: "",
  aspectRatio: AspectRatio.STORY,
  enhancements: DEFAULT_ENHANCEMENTS,
  userDescription: "",
  
  // Payment
  paymentStatus: PaymentStatus.IDLE,
  proofFile: null,
  proofPreviewUrl: null,
  paymentErrorMessage: null,

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
      // Reset result and payment if new file
      isComplete: false,
      resultImageUrl: null,
      paymentStatus: PaymentStatus.IDLE,
      proofFile: null,
      proofPreviewUrl: null
    });
  };

  // Step 1: User clicks "Proceed to Payment"
  const handleStartPayment = () => {
    if (!state.imageFile) return;
    updateState({ paymentStatus: PaymentStatus.PENDING });
  };

  // Step 2: User Uploads Proof
  const handleProofUpload = (file: File) => {
     const preview = URL.createObjectURL(file);
     updateState({
       proofFile: file,
       proofPreviewUrl: preview,
       paymentErrorMessage: null
     });
  };

  // Step 3: User Confirms Payment -> Validate with AI
  const handleVerifyPayment = async () => {
    if (!state.proofFile) return;

    updateState({ paymentStatus: PaymentStatus.VALIDATING, paymentErrorMessage: null });

    const validation = await validatePaymentProof(state.proofFile);

    if (validation.isValid) {
       // Payment Success! Start generation automatically.
       updateState({ paymentStatus: PaymentStatus.PAID });
       // Close modal logic is handled by status check in render or we can explicitly generate now
       await handleGenerate(true);
    } else {
       // Payment Failed
       updateState({ 
         paymentStatus: PaymentStatus.PENDING, // Go back to pending to allow retry
         paymentErrorMessage: validation.reason || "Não foi possível identificar o pagamento de R$ 1,00. Tente novamente."
       });
    }
  };

  // Step 4: Generate Image (called after payment success)
  const handleGenerate = async (skipPaymentCheck = false) => {
    if (!state.imageFile) return;
    
    // Safety check just in case
    if (!skipPaymentCheck && state.paymentStatus !== PaymentStatus.PAID) {
        alert("Pagamento necessário.");
        return;
    }

    // 1. Generate Prompt for UI display
    const prompt = generatePrompt(state);
    updateState({ 
      isProcessing: true, 
      generatedPrompt: prompt,
      isComplete: false,
      // Ensure modal is closed visually by setting status to PAID (which returns null in Modal component)
      paymentStatus: PaymentStatus.PAID 
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

  const handleRefine = async (instruction: string) => {
    if (!state.resultImageUrl) return;
    
    // Set processing to true to show loading screen again
    updateState({ 
      isProcessing: true, 
      isComplete: false 
    });
    
    try {
        const newResultUrl = await refineImage(state.resultImageUrl, instruction);
        updateState({ 
            isProcessing: false,
            isComplete: true,
            resultImageUrl: newResultUrl 
        });
    } catch (error) {
        console.error("Refine error", error);
        updateState({ 
          isProcessing: false,
          isComplete: true // Go back to showing the previous result if fail
        });
        alert("Erro ao refinar a imagem. Tente novamente.");
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
                 onGenerate={handleStartPayment} // Trigger Payment Flow
               />
             </div>
           )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 text-center border-t border-white/5 mt-12">
         <p className="text-gray-600 text-sm">© 2024 Photo Run. Transformando fotos em vendas.</p>
      </footer>

      {/* Modals & Overlays */}
      
      {/* Payment Modal */}
      <PaymentModal 
         status={state.paymentStatus}
         proofPreview={state.proofPreviewUrl}
         errorMessage={state.paymentErrorMessage}
         onClose={() => updateState({ paymentStatus: PaymentStatus.IDLE })}
         onUploadProof={handleProofUpload}
         onConfirmPayment={handleVerifyPayment}
      />

      {/* Result Overlay */}
      <ResultSection 
        state={state} 
        onReset={handleReset} 
        onRefine={handleRefine}
      />
    </div>
  );
};

export default App;