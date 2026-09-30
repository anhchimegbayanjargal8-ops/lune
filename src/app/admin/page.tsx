import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminDashboardPage() {
  const products = await getAllProducts();
  const withSizeChart = products.filter((p) => p.sizeChart.length > 0).length;

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Categories" value={CATEGORIES.length} />
        <StatCard label="Sized Products" value={withSizeChart} />
      </div>

      <div className="mt-10 border border-line p-6">
        <h2 className="font-display text-xl">Manage Products</h2>
        <p className="mt-2 text-sm text-taupe">
          Open a product to upload its front, back, side/detail, fabric close-up and
          on-model photography.
        </p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-[13px] uppercase tracking-widest2 hover-underline"
        >
          Go to Products →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line p-6">
      <p className="text-xs uppercase tracking-wide text-taupe">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}
