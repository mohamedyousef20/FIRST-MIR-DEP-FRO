"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ColorTheme = "blue" | "green" | "orange"

type ColorThemeContextType = {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined)

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorTheme, setColorTheme] = useState<ColorTheme>("blue")

  useEffect(() => {
    // Check if there's a saved theme in localStorage
    const savedColorTheme = localStorage.getItem("color-theme") as ColorTheme
    if (savedColorTheme) {
      setColorTheme(savedColorTheme)
    }
  }, [])

  useEffect(() => {
    // Apply the theme class to the html element
    const htmlElement = document.documentElement
    htmlElement.classList.remove("theme-blue", "theme-green", "theme-orange")
    htmlElement.classList.add(`theme-${colorTheme}`)

    // Save theme preference to localStorage
    localStorage.setItem("color-theme", colorTheme)
  }, [colorTheme])

  return <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>{children}</ColorThemeContext.Provider>
}

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider")
  }
  return context
}
