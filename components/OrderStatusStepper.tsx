import { statusSteps } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const activeIndex = statusSteps.indexOf(status);

  if (status === "Cancelled") {
    return <div className="rounded-lg bg-red-50 p-4 font-bold text-red-700">Cancelled</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {statusSteps.map((step, index) => (
        <div key={step} className={`rounded-lg border p-3 text-sm ${index <= activeIndex ? "border-leaf bg-leaf text-white" : "border-black/10 bg-white"}`}>
          {step}
        </div>
      ))}
    </div>
  );
}
