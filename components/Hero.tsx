import React from 'react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <header className="relative w-full py-20 md:py-32 px-6 flex flex-col items-center justify-center text-center bg-background overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="inline-block px-3 py-1 border border-primary/30 rounded-full bg-primary/10 mb-4 animate-fade-in-up">
            <span className="text-primary text-xs font-bold tracking-wider uppercase">Photo Run AI V1.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Transforme uma foto simples em uma <span className="text-primary">fotografia que vende.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Permitir que qualquer estabelecimento do ramo alimentício receba uma versão ultra realista, 
          profissional e editorial do próprio produto, mantendo o alimento exatamente como é.
        </p>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-primary rounded-full hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black"
        >
          <span>Enviar minha foto</span>
          <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </header>
  );
};