"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus, type OrderStatus } from "@/lib/actions/order-actions";

const statuses: OrderStatus[] = ["pending", "confirmed", "in_production", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [current, setCurrent] = React.useState(status);
  const [updating, setUpdating] = React.useState(false);

  async function handleChange(value: string) {
    const next = value as OrderStatus;
    setCurrent(next);
    setUpdating(true);
    try {
      const result = await updateOrderStatus(orderId, next);
      if (result.error) {
        toast.error(result.error);
        setCurrent(status);
        return;
      }
      toast.success("Order status updated");
      router.refresh();
    } catch (err) {
      setCurrent(status);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Select value={current} onValueChange={handleChange} disabled={updating}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
