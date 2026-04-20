import React from 'react';

const MirvoryShoesLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {/* الجزء البصري: يرمز لشكل حذاء رياضي من الجانب أو أثر الخطوات */}
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* خلفية بتأثير الحذاء الرياضي */}
        <div className="absolute inset-0 bg-black rounded-[14px] skew-x-3 group-hover:skew-x-0 transition-all duration-500"></div>
        
        {/* الرمز: حرف M مصمم ليشبه أربطة الحذاء أو علامة السرعة */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-7 h-7 text-white z-10 fill-none stroke-current stroke-[2.5]"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M4 18l4-12 4 12 4-12 4 12" />
          <line x1="12" y1="14" x2="15" y2="14" className="stroke-primary" />
        </svg>
      </div>

      {/* النص */}
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tighter text-black leading-none">
          MIRVORY<span className="text-primary">.</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">
          Sneaker Lab
        </span>
      </div>
    </div>
  );
};

export default MirvoryShoesLogo;
