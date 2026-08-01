"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { submitProductReviewAction } from "@/lib/actions/review-actions";
import { reviewSchema } from "@/lib/validation/review";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  open,
  onOpenChange,
  productId,
  orderId,
  productName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  orderId: string;
  productName: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setRating(0);
      setHoverRating(0);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = reviewSchema.safeParse({
      productId,
      orderId,
      rating,
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSaving(true);
    try {
      const result = await submitProductReviewAction(parsed.data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Thanks for your review!");
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`Review ${productName}`} className="max-w-lg p-8">
        <h2 className="h-display text-xl">Review {productName}</h2>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <Label>Rating</Label>
            <div className="mt-1.5 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                const filled = value <= (hoverRating || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn("h-6 w-6", filled ? "fill-tangerine-500 text-tangerine-500" : "fill-none text-border")}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Sum up your experience" required />
          </div>
          <div>
            <Label htmlFor="body">Review</Label>
            <Textarea id="body" name="body" placeholder="What did you like or dislike?" required />
          </div>
          <Button type="submit" variant="accent" size="lg" className="mt-2 w-full" disabled={saving}>
            {saving ? "Submitting..." : "Submit review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
