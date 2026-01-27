"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onSubmit?: () => void;
}

export const AuthCard = ({ title, description, children, isLoading, onSubmit }: AuthCardProps) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
