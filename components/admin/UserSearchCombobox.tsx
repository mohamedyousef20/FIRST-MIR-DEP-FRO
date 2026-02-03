'use client'

import { useState, useEffect, useCallback } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2, User, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/components/language-provider";
import { apiService } from "@/lib/api/apiService"

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface UserSearchComboboxProps {
  value: string[]
  onChange: (value: string[]) => void
  role?: 'user' | 'seller'
  multiple?: boolean
  className?: string
}

export function UserSearchCombobox({
  value,
  onChange,
  role,
  multiple = true,
  className
}: UserSearchComboboxProps) {
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  // Fetch users based on search query
  const searchUsers = useCallback(async (query: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.get(`/users/search?q=${query}${role ? `&role=${role}` : ''}`)
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [role])

  // Load selected users data when value changes
  useEffect(() => {
    const fetchSelectedUsers = async () => {
      if (!value.length) {
        setSelectedUsers([])
        return
      }
      try {
        const response = await apiService.get(`/users?ids=${value.join(',')}`)
        setSelectedUsers(response.data.data || [])
      } catch (error) {
        console.error('Error fetching selected users:', error)
      }
    }
    fetchSelectedUsers()
  }, [value])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery.trim())
      } else {
        setUsers([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchUsers])

  const handleSelect = (user: User) => {
    if (multiple) {
      const newValue = value.includes(user._id)
        ? value.filter(id => id !== user._id)
        : [...value, user._id]
      onChange(newValue)
    } else {
      onChange([user._id])
      setOpen(false)
    }
  }

  const removeUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(id => id !== userId))
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex flex-wrap gap-1 max-w-[80%] overflow-hidden">
              {selectedUsers.length > 0 ? (
                selectedUsers.map(user => (
                  <Badge
                    key={user._id}
                    variant="secondary"
                    className="flex items-center gap-1 mr-1 mb-1"
                  >
                    {user.firstName} {user.lastName}
                    <span
                      className="ml-1 cursor-pointer"
                      onClick={(e) => removeUser(user._id, e)}
                    >
                      ×
                    </span>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">
                  {isArabic ? 'اختر مستخدمين...' : 'Select users...'}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={isArabic ? "ابحث عن مستخدم..." : "Search users..."}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isArabic ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                ) : searchQuery ? (
                  isArabic ? 'لا توجد نتائج' : 'No users found'
                ) : (
                  isArabic ? 'اكتب للبحث عن مستخدمين' : 'Type to search users'
                )}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px] w-full">
                  {users.map((user) => (
                    <CommandItem
                      key={user._id}
                      value={user._id}
                      onSelect={() => handleSelect(user)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={cn(
                          "h-4 w-4 flex items-center justify-center rounded-sm border border-primary",
                          value.includes(user._id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                        )}>
                          <Check className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {user.role === 'seller' ? (
                              <Store className="h-4 w-4 text-amber-500" />
                            ) : (
                              <User className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {user.email}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.role === 'seller'
                              ? isArabic ? 'بائع' : 'Seller'
                              : isArabic ? 'مستخدم' : 'User'}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedUsers.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {isArabic
            ? `${selectedUsers.length} مستخدم محدد`
            : `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`}
        </div>
      )}
    </div>
  )
}
