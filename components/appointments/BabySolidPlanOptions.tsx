import { Check } from "lucide-react";
import { plans } from "@/lib/constants/plan";

interface BabySolidPlanOptionsProps {
  selectedPackageName?: string | null;
  variant?: "compact" | "detailed"; // compact for cards, detailed for detail pages
}

export default function BabySolidPlanOptions({
  selectedPackageName,
  variant = "compact",
}: BabySolidPlanOptionsProps) {
  const babyPlan = plans.find((p) => p.slug === "baby-solid-food");
  if (!babyPlan || !babyPlan.packages || babyPlan.packages.length !== 2) {
    return null;
  }

  const [option1, option2] = babyPlan.packages;

  if (variant === "compact") {
    return (
      <div className="mt-2 space-y-2">
        <div
          className={`p-2 rounded-lg border text-xs ${
            selectedPackageName === option1.name
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <div className="flex items-start gap-2">
            {selectedPackageName === option1.name && (
              <Check className="w-3 h-3 mt-0.5 text-emerald-600 shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-medium">{option1.name}</div>
            </div>
          </div>
        </div>
        <div
          className={`p-2 rounded-lg border text-xs ${
            selectedPackageName === option2.name
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <div className="flex items-start gap-2">
            {selectedPackageName === option2.name && (
              <Check className="w-3 h-3 mt-0.5 text-emerald-600 shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-medium">{option2.name}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant for detail pages
  return (
    <div className="mt-3 space-y-3">
      <div
        className={`p-4 rounded-lg border ${
          selectedPackageName === option1.name
            ? "bg-emerald-50 border-emerald-300"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {selectedPackageName === option1.name && (
            <Check className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
          )}
          <div className="flex-1">
            <div
              className={`font-semibold mb-1 ${
                selectedPackageName === option1.name
                  ? "text-emerald-900"
                  : "text-slate-700"
              }`}
            >
              {option1.name}
            </div>
            <div className="text-sm text-slate-600">{option1.details}</div>
          </div>
        </div>
      </div>
      <div
        className={`p-4 rounded-lg border ${
          selectedPackageName === option2.name
            ? "bg-emerald-50 border-emerald-300"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {selectedPackageName === option2.name && (
            <Check className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
          )}
          <div className="flex-1">
            <div
              className={`font-semibold mb-1 ${
                selectedPackageName === option2.name
                  ? "text-emerald-900"
                  : "text-slate-700"
              }`}
            >
              {option2.name}
            </div>
            <div className="text-sm text-slate-600">{option2.details}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
