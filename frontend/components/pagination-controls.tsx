"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxPagesToShow?: number;
  labels?: {
    previous?: string;
    next?: string;
  };
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxPagesToShow = 5,
  labels,

}) => {
  // default Arabic labels unless custom provided
  const resolvedLabels = labels || { previous: "السابق", next: "التالي" };

  const pages: (number | "ellipsis")[] = [];
  const half = Math.floor(maxPagesToShow / 2);

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage - 1 <= half) {
      end = maxPagesToShow - 1;
    }
    if (totalPages - currentPage <= half) {
      start = totalPages - (maxPagesToShow - 2);
    }

    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const handleChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handleChange(currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          >
            {resolvedLabels.previous}
          </PaginationPrevious>
        </PaginationItem>

        {pages.map((p, idx) => (
          <PaginationItem key={idx}>
            {p === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={p === currentPage}
                onClick={() => handleChange(p as number)}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => handleChange(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          >
            {resolvedLabels.next}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
