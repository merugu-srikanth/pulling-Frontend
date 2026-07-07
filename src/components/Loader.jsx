import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto shadow-lg shadow-brand-200 animate-pulse-slow">
          <Loader2 size={24} className="text-white animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading data...</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-4 flex-1 rounded" style={{ animationDelay: `${(i * cols + j) * 50}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SpinnerOverlay({ label = "Processing..." }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card flex items-center gap-4 px-8 py-6 shadow-2xl">
        <Loader2 size={28} className="text-brand-600 animate-spin" />
        <p className="text-slate-700 font-semibold">{label}</p>
      </div>
    </div>
  );
}

export default PageLoader;
