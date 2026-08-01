"use client";

import * as React from "react";
import { BadgeCheck } from "lucide-react";
import { ReviewDialog } from "@/components/account/ReviewDialog";
import { Button } from "@/components/ui/button";

export function OrderItemReviewAction({
  productId,
  orderId,
  productName,
  reviewed,
}: {
  productId: string;
  orderId: string;
  productName: string;
  reviewed: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  if (reviewed) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-tangerine-600">
        <BadgeCheck className="h-3.5 w-3.5" /> Reviewed
      </span>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Write a review
      </Button>
      <ReviewDialog
        open={open}
        onOpenChange={setOpen}
        productId={productId}
        orderId={orderId}
        productName={productName}
      />
    </>
  );
}
