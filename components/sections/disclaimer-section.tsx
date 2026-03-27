import { AlertTriangle } from "lucide-react";

export function DisclaimerSection() {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          Important Disclaimer
        </p>
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          This platform is intended for general informational and educational
          purposes only. It does not provide official tax, legal, or financial
          advice and should not be relied upon as a substitute for guidance from
          the Malta Tax &amp; Customs Administration, Bureau of Internal Revenue
          (BIR) or a licensed professional. For advice specific to your
          situation, please consult the appropriate government agency or a
          qualified tax advisor.
        </p>
      </div>
    </div>
  );
}
