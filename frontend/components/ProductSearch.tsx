"use client"

import React, { useState, useCallback, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils"

interface ProductSearchProps {
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  minChars?: number
  immediateSearch?: boolean
}

export function ProductSearch({
  onSearch,
  onClear,
  placeholder,
  className,
  autoFocus = false,
  minChars = 1,
  immediateSearch = false,
}: ProductSearchProps) {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < minChars) {
      return
    }

    setIsSearching(true)
    try {
      await onSearch(query)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }, [onSearch, minChars])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (immediateSearch && value.trim().length >= minChars) {
      handleSearch(value)
    }
  }, [handleSearch, immediateSearch, minChars])

  const handleClear = useCallback(() => {
    setSearchQuery("")
    inputRef.current?.focus()
    onClear?.()
  }, [onClear])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }, [searchQuery, handleSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  const defaultPlaceholder = language === "ar"
    ? `ابحث عن المنتجات... ${minChars > 1 ? `(حد أدنى ${minChars} حروف)` : ''}`
    : `Search for products... ${minChars > 1 ? `(min ${minChars} chars)` : ''}`

  const showClearButton = searchQuery && !isSearching
  const showLoader = isSearching

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
      role="search"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 pr-10 rtl:pr-10 rtl:pl-10 transition-all",
            searchQuery && "pr-20 rtl:pl-20"
          )}
          aria-label={language === "ar" ? "شريط البحث" : "Search bar"}
          aria-busy={isSearching}
        />

        {/* Loading Indicator */}
        {showLoader && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3"
            role="status"
            aria-label={language === "ar" ? "جاري البحث" : "Searching"}
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Clear Button */}
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rtl:right-auto rtl:left-1"
            aria-label={language === "ar" ? "مسح البحث" : "Clear search"}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}