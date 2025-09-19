import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-pastel-pink-light via-pastel-white to-pastel-blue-light py-32 px-4 overflow-hidden">
      {/* Cute Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fce7f3%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Cute Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200/40 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-pink-300/20 rounded-full blur-md animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-blue-300/30 rounded-full blur-sm animate-float" style={{animationDelay: '3s'}}></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-pink-200 to-pink-300 rounded-cute flex items-center justify-center mx-auto mb-6 animate-scale-in shadow-floating">
            <img src="/logo.jpg" alt="H&HBC SHOPPE Logo" className="w-20 h-20 rounded-soft object-cover" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-noto font-bold text-soft-800 mb-8 animate-fade-in tracking-tight">
          H&HBC SHOPPE
          <span className="block text-pink-500 mt-4 text-2xl md:text-3xl font-light tracking-widest">✨ Beauty • Cosmetics • Care ✨</span>
        </h1>
        
        <p className="text-xl text-soft-600 mb-12 max-w-4xl mx-auto animate-slide-up leading-relaxed font-light">
          Discover your perfect beauty routine with our curated collection of premium hair care, 
          cosmetics, skin care, and nail care products. Quality ingredients, stunning results. 💕
        </p>
        
        <div className="flex justify-center animate-slide-up">
          <button 
            onClick={() => {
              const element = document.querySelector('[data-catalog]');
              if (element) {
                const headerHeight = 80;
                const offset = headerHeight + 20;
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({
                  top: elementPosition,
                  behavior: 'smooth'
                });
              }
            }}
            className="group bg-gradient-to-r from-pink-400 to-pink-500 text-white px-12 py-6 rounded-cute hover:from-pink-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold text-xl shadow-floating hover:shadow-glow relative overflow-hidden border border-pink-300/50"
          >
            <span className="relative z-10 tracking-wider">🛍️ Shop Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;