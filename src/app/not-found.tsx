import { ButtonLink } from "@/components/ui/Button";
import { CrescentMark } from "@/components/ui/CrescentMark";

export default function NotFound() {
  return (
    <div className="container-lune flex min-h-[70vh] flex-col items-center justify-center text-center">
      <CrescentMark className="h-8 w-8 text-rose-deep" />
      <h1 className="mt-6 text-4xl font-display font-medium sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-sm text-taupe">
        The page you&apos;re looking for may have moved, sold out, or never existed.
      </p>
      <ButtonLink href="/" variant="primary" size="lg" className="mt-8">
        Back to Home
      </ButtonLink>
    </div>
  );
}
