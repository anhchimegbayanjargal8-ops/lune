import { SizeMeasurement } from "@/lib/types";

export function SizeChartTable({ chart }: { chart: SizeMeasurement[] }) {
  if (chart.length === 0) {
    return <p className="text-sm text-taupe">This piece is sized One Size — no chart needed.</p>;
  }

  const columns: { key: keyof SizeMeasurement; label: string }[] = [
    { key: "bust", label: "Bust" },
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
    { key: "shoulder", label: "Shoulder" },
    { key: "length", label: "Length" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="py-3 pr-4 text-xs uppercase tracking-wide text-taupe">Size</th>
            {columns.map((col) => (
              <th key={col.key} className="py-3 pr-4 text-xs uppercase tracking-wide text-taupe">
                {col.label} (cm)
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.map((row) => (
            <tr key={row.size} className="border-b border-line last:border-b-0">
              <td className="py-3 pr-4 font-medium text-ink">{row.size}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-3 pr-4 tabular-nums text-taupe">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-taupe">
        Measurements are of the garment itself, laid flat. All figures in centimetres.
      </p>
    </div>
  );
}
