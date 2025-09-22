"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type NativeInputProps = React.ComponentProps<"input">;

export interface CurrencyInputProps
  extends Omit<NativeInputProps, "onChange" | "value"> {
  value: string; // raw numeric string, e.g. "1000" or "1234.5"
  /**
   * Event-style handler (keeps your existing usage):
   * onChange={(e) => handleChange("taxAmount", e.target.value)}
   * e.target.value will be the raw numeric string (no commas), formatted to two decimals on blur.
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Simpler handler that directly provides the raw string:
   * onValueChange={(val) => handleChange("taxAmount", val)}
   */
  onValueChange?: (val: string) => void;
  hasError?: boolean;
}

/** Helpers */
function stripToNumeric(val: string) {
  if (!val) return "";
  // remove non digits except dot, keep only first dot
  const s = val.replace(/[^0-9.]/g, "");
  const parts = s.split(".");
  return parts.length > 1 ? parts.shift() + "." + parts.join("") : s;
}

function formatWithCommas(raw: string) {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  // Avoid Number(intPart) when intPart is empty (keep "0")
  const intNum = intPart ? Number(intPart) : 0;
  const formattedInt = intNum.toLocaleString("en-US");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function formatWithCommasTwoDecimals(raw: string) {
  if (!raw) return "";
  const n = Number.parseFloat(raw);
  if (!isFinite(n)) return raw;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Minimal synthetic change event factory (only target.value used) */
function makeSyntheticChangeEvent(
  raw: string,
): React.ChangeEvent<HTMLInputElement> {
  const synthetic = {
    target: { value: raw },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
  return synthetic;
}

/** Component */
export function CurrencyInput({
  value,
  onChange,
  onValueChange,
  placeholder = "0.00",
  className,
  hasError,
  ...props
}: CurrencyInputProps) {
  // Keep display state: when focused -> raw (no commas, no forced .00)
  // when blurred -> formatted with commas and (on blur) forced to 2 decimals
  const [display, setDisplay] = React.useState<string>(() =>
    value ? formatWithCommas(value) : "",
  );
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (isFocused) {
      // show raw while editing (no commas)
      setDisplay(value ?? "");
    } else {
      // when not focused, show formatted with 2 decimals
      setDisplay(value ? formatWithCommasTwoDecimals(value) : "");
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;
    // strip commas and non-numeric characters (keep dot)
    const rawCandidate = stripToNumeric(typed);

    // valid while typing: allow empty, digits, optional single dot
    if (/^-?$|^-?\d*\.?\d*$/.test(rawCandidate)) {
      // update display while focused to the rawCandidate (no commas)
      setDisplay(
        isFocused
          ? rawCandidate
          : formatWithCommasTwoDecimals(rawCandidate || ""),
      );
      // notify parent with raw value (no commas). We don't force 2 decimals until blur.
      if (onValueChange) onValueChange(rawCandidate);
      if (onChange) onChange(makeSyntheticChangeEvent(rawCandidate));
    } else {
      // invalid input: ignore or show sanitized
      const sanitized = typed.replace(/,/g, "");
      setDisplay(sanitized);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // show raw value without commas for editing
    setDisplay(value ?? "");
    if (typeof props.onFocus === "function") props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // If empty or invalid partial tokens, clear and notify parent
    if (!display || display === "-" || display === "." || display === "-.") {
      if (onValueChange) onValueChange("");
      if (onChange) onChange(makeSyntheticChangeEvent(""));
      setDisplay("");
      if (typeof props.onBlur === "function") props.onBlur(e);
      return;
    }

    // Ensure numeric and force 2 decimals
    const numeric = stripToNumeric(display);
    const parsed = Number.parseFloat(numeric);
    if (!isFinite(parsed)) {
      if (typeof props.onBlur === "function") props.onBlur(e);
      return;
    }

    const rawTwoDecimals = parsed.toFixed(2); // raw string like "100.00"
    const formatted = formatWithCommasTwoDecimals(rawTwoDecimals);

    setDisplay(formatted);
    if (onValueChange) onValueChange(rawTwoDecimals);
    if (onChange) onChange(makeSyntheticChangeEvent(rawTwoDecimals));
    if (typeof props.onBlur === "function") props.onBlur(e);
  };

  return (
    <div className="relative">
      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
        €
      </span>
      <Input
        {...(props as React.ComponentProps<"input">)}
        // allow consumers to pass type="number" but we render as text so commas can be displayed
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={display}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={[
          "h-11 pl-8",
          hasError
            ? "border-destructive focus:border-destructive focus:ring-destructive"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}
