import React from 'react';
import { AppState, FoodType, AspectRatio, EnhancementOption } from '../types';

interface ConfigurationProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onGenerate: () => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({ state, updateState, onGenerate }) => {
  
  const handleFoodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateState({ selectedFoodType: e.target.value as FoodType });
  };

  const handleEnhancementToggle = (id: string) => {
    const updated = state.enhancements.map(opt => 
      opt.id === id ? { ...opt, selected: !opt.selected } : opt
    );
    updateState({ enhancements: updated });
  };

  const handleRatioChange = (ratio: AspectRatio) => {
    updateState({ aspectRatio: ratio });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState({ userDescription: e.target.value });
  };

  const isFormValid = state.imageFile !== null && state.selectedFoodType !== "";

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      
      {/* Left Column: Food Type & Enhancements */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3">2</span>
            Tipo de Alimento
          </h2>
          <div className="relative">
            <select
              value={state.selectedFoodType}
              onChange={handleFoodTypeChange}
              className="w-full bg-surface border border-border text-white rounded-lg p-4 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="" disabled>Selecione a categoria...</option>
              {Object.values(FoodType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3">3</span>
            Melhorias Visuais
          </h2>
          <div className="space-y-3">
            {state.enhancements.map((opt) => (
              <label key={opt.id} className="flex items-start space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="relative flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={opt.selected}
                    onChange={() => handleEnhancementToggle(opt.id)}
                    className="peer appearance-none h-5 w-5 border border-gray-600 rounded bg-transparent checked:bg-primary checked:border-primary transition-all"
                  />
                  <svg className="absolute w-3.5 h-3.5 text-black pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors select-none">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
           <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-600 text-gray-400 text-xs font-bold mr-3">i</span>
            Instruções Adicionais (Opcional)
          </h2>
          <textarea
            value={state.userDescription}
            onChange={handleDescriptionChange}
            placeholder="Ex: Quero um ambiente mais rústico com madeira escura, ou adicione mais vapor saindo do prato..."
            className="w-full bg-surface border border-border text-white rounded-lg p-4 focus:outline-none focus:border-primary transition-colors resize-none h-32 text-sm placeholder-gray-600"
          />
        </div>
      </div>

      {/* Right Column: Aspect Ratio & Action */}
      <div className="space-y-8 flex flex-col">
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3">4</span>
            Proporção Final
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(AspectRatio).map((ratio) => (
              <label 
                key={ratio}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${state.aspectRatio === ratio 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-surface hover:border-gray-500'}
                `}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={state.aspectRatio === ratio}
                  onChange={() => handleRatioChange(ratio)}
                  className="hidden"
                />
                <span className="text-lg font-bold text-white mb-1">{ratio}</span>
                <span className="text-xs text-gray-500 uppercase">
                  {ratio === AspectRatio.STORY ? 'Stories/Reels' : 
                   ratio === AspectRatio.SQUARE ? 'Instagram Feed' : 
                   ratio === AspectRatio.PORTRAIT ? 'Portrait' : 'Youtube'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={onGenerate}
            disabled={!isFormValid || state.isProcessing}
            className={`
              w-full relative group overflow-hidden rounded-full p-1
              ${!isFormValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 rounded-full transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"></div>
            <div className="relative bg-black rounded-full px-8 py-4 flex items-center justify-center transition-all group-hover:bg-transparent">
               <span className={`text-lg font-bold uppercase tracking-wider transition-colors ${!isFormValid ? 'text-gray-500' : 'text-white group-hover:text-black'}`}>
                 Prosseguir para Pagamento
               </span>
               {isFormValid && (
                 <svg className="w-5 h-5 ml-2 text-white group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               )}
            </div>
          </button>
          
          <p className="text-center text-xs text-gray-600 mt-4">
            Total: R$ 1,00 - Investimento na sua imagem profissional.
          </p>
        </div>
      </div>
    </div>
  );
};