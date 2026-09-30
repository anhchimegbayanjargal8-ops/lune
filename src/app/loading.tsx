import { CrescentMark } from "@/components/ui/CrescentMark";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <CrescentMark spin className="h-6 w-6 text-taupe" />
    </div>
  );
}
