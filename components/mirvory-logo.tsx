export default function MirvoryLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  return (
    <div className="flex items-center justify-center bg-black min-h-screen">
      <div
        className={`
          flex items-center
          font-black tracking-tighter
          ${sizeClasses[size]}
          select-none
          group
          cursor-default
        `}
        style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
      >
        {/* MIR */}
        <span
          className="text-white transition-colors duration-300 group-hover:text-gray-100"
          style={{ letterSpacing: '-0.02em' }}
        >
          MIR
        </span>

        {/* V */}
        <span
          className="text-white transition-colors duration-300 group-hover:text-gray-100"
          style={{ letterSpacing: '-0.02em' }}
        >
          V
        </span>

        {/* Speed lines + O wrapper */}
        <span className="relative inline-flex items-center justify-center">
          {/* Speed lines before O */}
          <span
            className="absolute flex flex-col justify-center gap-[3px] transition-all duration-300 group-hover:gap-[4px]"
            style={{ right: '78%', top: '50%', transform: 'translateY(-50%)' }}
            aria-hidden="true"
          >
            <span
              className="block bg-red-600 rounded-full transition-all duration-300 group-hover:w-[1.1em]"
              style={{ height: '3px', width: '0.85em' }}
            />
            <span
              className="block bg-red-600 rounded-full transition-all duration-300 group-hover:w-[0.9em]"
              style={{ height: '3px', width: '0.65em' }}
            />
            <span
              className="block bg-red-600 rounded-full transition-all duration-300 group-hover:w-[0.7em]"
              style={{ height: '3px', width: '0.45em' }}
            />
          </span>

          {/* O in red */}
          <span
            className="text-red-600 transition-all duration-300 group-hover:text-red-500"
            style={{ letterSpacing: '-0.02em' }}
          >
            O
          </span>
        </span>

        {/* RY */}
        <span
          className="text-white transition-colors duration-300 group-hover:text-gray-100"
          style={{ letterSpacing: '-0.02em' }}
        >
          RY
        </span>
      </div>
    </div>
  );
}
