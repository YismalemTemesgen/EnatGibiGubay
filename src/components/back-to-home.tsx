import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackToHome({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1 text-sm text-primary hover:underline ${className}`}
    >
      <ArrowLeft className="h-4 w-4" /> ተመለስ
    </Link>
  );
}