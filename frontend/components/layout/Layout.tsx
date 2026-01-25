"use client"

import React from 'react';
import { Header } from "./components/Header";
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
  cartCount?: number;
}

export const Layout = ({ children, cartCount = 0 }: LayoutProps) => {
  return (

    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} />
      <main className="flex-1">

        {children}
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
};
