import React, { useRef, useState } from 'react';
import { PaymentStatus } from '../types';

interface PaymentModalProps {
  status: PaymentStatus;
  proofPreview: string | null;
  errorMessage: string | null;
  onClose: () => void;
  onUploadProof: (file: File) => void;
  onConfirmPayment: () => void;
}

const PIX_KEY = "686e0c79-6454-4a4b-a5d9-2604ef786369";
const PIX_VALUE = "R$ 1,00";

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  status, 
  proofPreview, 
  errorMessage,
  onClose, 
  onUploadProof, 
  onConfirmPayment 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadProof(e.target.files[0]);
    }
  };

  if (status === PaymentStatus.IDLE || status === PaymentStatus.PAID) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-gray-800 rounded-2xl w-full max-w-lg p-6 md:p-8 relative animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          disabled={status === PaymentStatus.VALIDATING}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Pagamento Seguro</h2>
          <p className="text-gray-400 text-sm mt-1">Sua foto profissional por apenas <span className="text-white font-bold">{PIX_VALUE}</span></p>
        </div>

        {/* PIX INFO */}
        <div className="bg-black/40 rounded-xl p-4 border border-dashed border-gray-700 mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">Chave Pix (Copia e Cola)</label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-black p-3 rounded text-sm text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap border border-gray-800 font-mono">
              {PIX_KEY}
            </code>
            <button 
              onClick={handleCopy}
              className={`p-3 rounded font-bold text-sm transition-all ${copied ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-orange-600'}`}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* PROOF UPLOAD */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-white mb-2">Comprovante de Pagamento</label>
          <p className="text-xs text-gray-500 mb-3">O valor de <span className="text-white">{PIX_VALUE}</span> precisa estar visível na imagem.</p>
          
          <div 
            onClick={() => status !== PaymentStatus.VALIDATING && fileInputRef.current?.click()}
            className={`
              w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all
              ${status === PaymentStatus.VALIDATING ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-white/5'}
              ${errorMessage ? 'border-red-500 bg-red-500/10' : 'border-gray-700 bg-surface'}
            `}
          >
            {proofPreview ? (
              <img src={proofPreview} alt="Comprovante" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-400">Clique para enviar comprovante</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
              disabled={status === PaymentStatus.VALIDATING}
            />
          </div>
          
          {errorMessage && (
             <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-xs text-red-200">{errorMessage}</p>
             </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={onConfirmPayment}
          disabled={!proofPreview || status === PaymentStatus.VALIDATING}
          className={`
            w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all
            ${!proofPreview || status === PaymentStatus.VALIDATING 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-500 hover:scale-[1.02] shadow-lg shadow-green-900/20'}
          `}
        >
          {status === PaymentStatus.VALIDATING ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validando Comprovante...
            </>
          ) : (
            "Confirmar Pagamento"
          )}
        </button>

      </div>
    </div>
  );
};