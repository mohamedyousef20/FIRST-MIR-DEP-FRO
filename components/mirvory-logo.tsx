"use client"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Image from "next/image"

const MirvoryLogo = ({
  className = "",
  animated = true,
  width = 200,
  height = 60,
  priority = false
}: {
  className?: string;
  animated?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) => {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle SSR
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Animation control
  const isAnimated = animated && isMounted
  const animationClass = isAnimated ? "transition-all duration-300 ease-in-out" : ""

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Container */}
      <div className={`relative ${animationClass}`}>
        {/* Decorative glow effect */}
        {isAnimated && (
          <div
            className={`absolute inset-0 rounded-lg ${animationClass}`}
            style={{
              background: isHovered
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)'
                : 'transparent',
              filter: isHovered ? 'blur(8px)' : 'none',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              zIndex: -1
            }}
          />
        )}

        {/* Main Logo Image */}
        <Image
          src="https://res.cloudinary.com/dkmrrisek/image/upload/v1770138944/ChatGPT_Image_3_%D9%81%D8%A8%D8%B1%D8%A7%D9%8A%D8%B1_2026_07_14_42_%D9%85_niyibz.png" // You'll need to place your image in the public folder
          alt="Mirvory Logo"
          width={width}
          height={height}
          priority={priority}
          className={`
            ${animationClass}
            ${isAnimated ? 'hover:scale-105' : ''}
            ${isDarkMode ? 'filter brightness-110' : ''}
          `}
          style={{
            transform: isHovered && isAnimated ? 'translateY(-2px)' : 'none',
            filter: isDarkMode
              ? (isHovered ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))' : 'brightness(1.1)')
              : (isHovered ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' : 'none')
          }}
        />

        {/* Optional animated underline */}
        {isAnimated && (
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${animationClass}`}
            style={{
              width: isHovered ? '80%' : '0%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
              opacity: isHovered ? 0.8 : 0
            }}
          />
        )}
      </div>
    </div>
  )
}

export default MirvoryLogo
