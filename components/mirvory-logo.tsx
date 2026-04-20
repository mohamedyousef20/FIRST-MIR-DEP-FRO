"use client";

import React from "react";

type Size = "sm" | "default" | "lg";

export default function MirvoryLogo({ size = "default" }: { size?: Size }) {
  const sizeMap = {
    sm: "text-4xl",
    default: "text-7xl",
    lg: "text-9xl",
  };

  return (
    <div className="flex items-center justify-center bg-black w-full min-h-screen">
      <span
        className={`
          flex items-center
          ${sizeMap[size]}
          font-black uppercase
          select-none group cursor-default
        `}
        style={{
          fontFamily: "'Arial Black', 'Impact', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        {/* MIR */}
        <span className="text-white transition-all duration-300 group-hover:opacity-90">
          MIR
        </span>

        {/* V */}
        <span
          className="text-white transition-all duration-300 group-hover:opacity-90"
          style={{ display: "inline-block", transform: "skewX(-4deg)" }}
        >
          V
        </span>

        {/* O + Motion */}
        <span className="relative inline-flex items-center mx-1">
          {/* Motion lines */}
          <span className="absolute right-full mr-1 flex flex-col justify-center gap-[3px] pointer-events-none">
            <span className="h-[3px] w-6 bg-red-600 rounded-full transition-all duration-300 group-hover:w-8" />
            <span className="h-[3px] w-4 bg-red-600 rounded-full transition-all duration-300 group-hover:w-6" />
            <span className="h-[3px] w-2 bg-red-600 rounded-full transition-all duration-300 group-hover:w-4" />
          </span>

          {/* O */}
          <span className="text-red-600 transition-all duration-300 group-hover:text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            O
          </span>
        </span>

        {/* RY */}
        <span className="text-white transition-all duration-300 group-hover:opacity-90">
          RY
        </span>
      </span>
    </div>
  );
}
