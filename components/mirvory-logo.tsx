import React from 'react';

const MirvoryLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {/* الجزء البصري: يدمج بين حرف M وشكل الموشور أو البلورة الكيميائية */}
      <div className="relative flex items-center justify-center w-11 h-11">
        {/* المربع المائل كخلفية لإعطاء طابع هندسي */}
        <div className="absolute inset-0 bg-slate-900 rounded-xl rotate-6 group-hover:rotate-0 transition-all duration-500 ease-in-out"></div>
        
        {/* الرمز: مثلثان متداخلان يشكلان حرف M مع رابطة كيميائية */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6 text-white z-10 fill-none stroke-current stroke-[2.5]"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 20V4l9 12 9-12v16" />
          <circle cx="12" cy="16" r="1.5" className="fill-primary stroke-none" />
        </svg>
      </div>

      {/* الجزء النصي */}
      <div className="flex flex-col leading-tight">
        <span className="text-2xl font-black tracking-tight text-slate-900">
          MIRVORY
        </span>
      </div>
    </div>
  );
};

export default MirvoryLogo;
