"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useParams } from "next/navigation"

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params?.id as string
  
  useEffect(() => {
    if (categoryId) {
      router.replace(`/categories/${categoryId}/products`)
    }
  }, [categoryId])

  return null
}
