"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageSrc: string;
  className?: string;
}

export const HeroSection = ({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  imageSrc,
  className = "",
}: HeroSectionProps) => {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary/20" />
      <div className="relative container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {subtitle && (
              <h2 className="text-2xl font-semibold text-primary">
                {subtitle}
              </h2>
            )}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {description}
            </p>
            <Button asChild size="lg">
              <a href={ctaLink} className="flex items-center gap-2">
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="relative aspect-video">
            <div className="absolute inset-0 bg-gradient-to-r from-background to-background/80" />
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};
