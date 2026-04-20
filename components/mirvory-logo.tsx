import React from 'react';

const MirvoryLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      {/* الجزء البصري: يرمز للرابطة الكيميائية أو التفاعل */}
      <div className="relative flex items-center justify-center w-10 h-10">
        {/* الدائرة الخلفية */}
        <div className="absolute inset-0 bg-primary/10 rounded-xl rotate-3 group-hover:rotate-12 transition-transform duration-300"></div>
        
        {/* أيقونة تعبيرية بسيطة (دائرتان متصلتان) */}
        <div className="relative flex items-center">
          <div className="w-4 h-4 rounded-full border-2 border-primary bg-white z-10"></div>
          <div className="w-3 h-[2px] bg-primary -mx-1"></div>
          <div className="w-4 h-4 rounded-full bg-primary"></div>
        </div>
      </div>

      {/* الجزء النصي */}
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter text-slate-900">
          KEEMA<span className="text-primary">LINK</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mr-0.5">
          Chemical Solutions
        </span>
      </div>
    </div>
  );
};

export default MirvoryLogo;
