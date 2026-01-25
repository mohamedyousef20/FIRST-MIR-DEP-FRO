"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardListProps {
  items: any[];
  loading?: boolean;
  columns?: number;
  renderItem: (item: any) => React.ReactNode;
  emptyMessage?: string;
}

export const CardList = ({
  items,
  loading = false,
  columns = 3,
  renderItem,
  emptyMessage = "لا توجد عناصر"
}: CardListProps) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}> 
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}> 
      {items.map((item, index) => (
        <Card key={index} className="p-4">
          {renderItem(item)}
        </Card>
      ))}
    </div>
  );
};
