import { plans } from "../plan";
import PlanCard from "@/components/home/PlanCard";
import { notFound } from "next/navigation";

export default async function ServiceDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ⬅️ Required in Next.js 15

  const plan = plans.find((p) => p.slug === slug);

  if (!plan) return notFound();

  return (
    <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
      <PlanCard {...plan} />
    </div>
  );
}
