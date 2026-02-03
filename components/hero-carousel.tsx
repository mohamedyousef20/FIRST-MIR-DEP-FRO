"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { announcementService } from "@/lib/api"

interface Announcement {
  _id?: string;
  image?: string;
  title?: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  link?: string;
}

export function HeroCarousel() {
  const { language } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const response = await announcementService.getMainAnnouncements();
        // Handle both array and single object responses
        //console.log(response.data, 'ann')
        //console.log(response, 'ann')
        //console.log(response, 'ann')
        //console.log(response, 'ann')
        //console.log(response, 'ann')
        //console.log(response, 'ann')
        //console.log(response, 'ann')
        //console.log(response, 'ann')
        if (Array.isArray(response.data)) {
          setAnnouncements(response.data)
        } else if (response.data && typeof response.data === 'object') {
          // If it's a single announcement object, wrap it in an array
          setAnnouncements([response.data])
        } else {
          setAnnouncements([])
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const nextSlide = () => {
    if (announcements.length <= 1) return; // Don't navigate if only one item
    setCurrentSlide((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    if (announcements.length <= 1) return; // Don't navigate if only one item
    setCurrentSlide((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (announcements.length <= 1) return // Don't auto-rotate if only one or no slides

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [announcements.length])

  // Don't render carousel if no announcements
  if (loading) {
    return (
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-muted animate-pulse">
        <div className="container h-full flex items-center">
          <div className="max-w-lg space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            <div className="h-12 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-muted">
        <div className="container h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              {language === "ar" ? "لا توجد إعلانات متاحة" : "No announcements available"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasMultipleSlides = announcements.length > 1;

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(${language === "ar" ? currentSlide * 100 : -currentSlide * 100}%)`
        }}
      >
        {announcements.map((announcement) => (
          <div key={announcement._id} className="min-w-full relative">
            <div className="relative aspect-[21/9] md:aspect-[3/1]">
              <Image
                src={announcement.image || "/placeholder.svg"}
                alt={(language === 'ar' ? announcement.title : announcement.titleEn) ?? ''}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 dark:from-background/90 dark:to-background/30">
                <div className="container h-full flex items-center">
                  <div className="max-w-lg space-y-4">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                      {language === "ar" ? announcement.title : announcement.titleEn || announcement.title}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground">
                      {language === "ar" ? announcement.content : announcement.contentEn || announcement.content}
                    </p>
                    <Button asChild size="lg">
                      <Link href={announcement.link || "/"}>
                        {language === "ar" ? "تسوق الآن" : "Shop Now"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons - only show if there are multiple announcements */}
      {hasMultipleSlides && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
            {announcements.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${currentSlide === index ? "bg-primary" : "bg-muted"}`}
                onClick={() => setCurrentSlide(index)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}