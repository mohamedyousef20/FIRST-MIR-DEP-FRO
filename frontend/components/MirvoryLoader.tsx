import React from 'react'
import { Loader2 } from "lucide-react"

interface MirvoryLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const MirvoryLoader: React.FC<MirvoryLoaderProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizes[size]}`} />
    </div>
  )
}

interface MirvoryPageLoaderProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const MirvoryPageLoader: React.FC<MirvoryPageLoaderProps> = ({ text = "جاري التحميل...", size = 'lg', className = '' }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <MirvoryLoader size={size} className={className} />
        <p className="text-gray-600 mt-4 text-sm">{text}</p>
      </div>
    </div>
  )
}
