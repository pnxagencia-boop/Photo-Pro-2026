import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  currentPreview: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, currentPreview }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    // Basic validation
    if (!file.type.match('image.*')) {
      alert("Por favor, envie apenas arquivos de imagem (JPG, PNG, HEIC).");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold mr-3">1</span>
        Upload da Imagem
      </h2>
      
      <div 
        className={`relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group
          ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-700 bg-surface hover:border-gray-500'}
          ${currentPreview ? 'border-solid border-primary/50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          onChange={handleChange} 
          accept="image/png, image/jpeg, image/heic"
          className="hidden" 
        />

        {currentPreview ? (
          <div className="w-full h-full relative group">
            <img 
              src={currentPreview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-medium flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Trocar Imagem
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
               <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2">Clique ou arraste sua foto</p>
            <p className="text-sm text-gray-500">JPG, PNG ou HEIC de alta qualidade</p>
          </div>
        )}
      </div>
    </div>
  );
};