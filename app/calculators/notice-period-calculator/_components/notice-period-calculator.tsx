'use client'
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon } from "lucide-react";

// DatePicker component
const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  hasError = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange(formattedDate);
    } else {
      onChange("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            hasError &&
              "border-destructive focus:border-destructive focus:ring-destructive",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "d LLL yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

type Results = {
  requiredWeeks: number;
  noticeStarts: Date;
  lastDayOfEmployment: Date;
  serviceMonths: number;
  serviceYears: number;
  isInProbation: boolean;
};

function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

// function addWeeks(d: Date, weeks: number): Date {
//   return addDays(d, weeks * 7);
// }

// More accurate month calculation for employment service
function calculateServicePeriod(
  start: Date,
  end: Date,
): { months: number; years: number } {
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();

  const endYear = end.getFullYear();
  const endMonth = end.getMonth();
  const endDay = end.getDate();

  let months = (endYear - startYear) * 12 + (endMonth - startMonth);

  // If we haven't reached the day of the month yet, subtract one month
  if (endDay < startDay) {
    months -= 1;
  }

  const years = Math.floor(months / 12);

  return { months: Math.max(0, months), years };
}

function nextWorkingDay(date: Date): Date {
  let cur = new Date(date);
  cur = addDays(cur, 1);
  while (cur.getDay() === 0 || cur.getDay() === 6) {
    cur = addDays(cur, 1);
  }
  return cur;
}

function computeRequiredWeeks(
  start: Date,
  noticeDate: Date,
): {
  weeks: number;
  serviceMonths: number;
  serviceYears: number;
  isInProbation: boolean;
} | null {
  if (!start || !noticeDate) return null;
  if (noticeDate <= start) return null;

  const { months, years } = calculateServicePeriod(start, noticeDate);

  // Check if in probationary period (assuming 6 months probation is standard)
  const isInProbation = months < 6;

  // During probation: 1 week notice if service exceeds 1 month
  if (isInProbation) {
    if (months <= 1) {
      return {
        weeks: 0,
        serviceMonths: months,
        serviceYears: years,
        isInProbation: true,
      };
    } else {
      return {
        weeks: 1,
        serviceMonths: months,
        serviceYears: years,
        isInProbation: true,
      };
    }
  }

  // Regular notice periods based on Article 36
  let weeks: number;

  if (months <= 1) {
    weeks = 0;
  } else if (months <= 6) {
    weeks = 1;
  } else if (months <= 24) {
    // up to 2 years
    weeks = 2;
  } else if (months <= 48) {
    // up to 4 years
    weeks = 4;
  } else if (months <= 84) {
    // up to 7 years
    weeks = 8;
  } else {
    // More than 7 years: 8 weeks + 1 week per additional year (max 12 weeks)
    const yearsAfterSeven = years - 7;
    weeks = Math.min(12, 8 + yearsAfterSeven);
  }

  return {
    weeks,
    serviceMonths: months,
    serviceYears: years,
    isInProbation: false,
  };
}

export default function NoticePeriodCalculator() {
  const [startDate, setStartDate] = useState<string>("");
  const [noticeDate, setNoticeDate] = useState<string>("");

  const results = useMemo<Results | null>(() => {
    const s = parseDate(startDate);
    const n = parseDate(noticeDate);
    if (!s || !n) return null;
    if (n <= s) return null;

    const computed = computeRequiredWeeks(s, n);
    if (computed === null) return null;

    const {
      weeks: requiredWeeks,
      serviceMonths,
      serviceYears,
      isInProbation,
    } = computed;

    // Notice period starts on the first working day after notice is given
    const noticeStarts = nextWorkingDay(n);

    // Last day of employment is notice start + (required weeks * 7) - 1
    // This ensures the notice period is exactly the required number of weeks
    const lastDayOfEmployment = addDays(noticeStarts, requiredWeeks * 7 - 1);

    return {
      requiredWeeks,
      noticeStarts,
      lastDayOfEmployment,
      serviceMonths,
      serviceYears,
      isInProbation,
    };
  }, [startDate, noticeDate]);

  const fmt = (d: Date | null | undefined) =>
    d ? format(d, "d LLL yyyy") : "—";

  // Validation errors
  const hasError = useMemo(() => {
    const s = parseDate(startDate);
    const n = parseDate(noticeDate);
    if (!s || !n) return null;
    if (n <= s) return "Notice date must be after start date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (s > today) return "Start date cannot be in the future";

    return null;
  }, [startDate, noticeDate]);

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold lg:text-5xl">
          Malta Notice Period Calculator
        </h1>
        <p className="text-muted-foreground mt-2 text-xl">
          Calculate required notice periods under Article 36 of the Employment
          and Industrial Relations Act
        </p>
      </div>

      {hasError && (
        <Alert className="border-destructive mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{hasError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Employment Start Date
                  </Label>
                  <DatePicker
                    value={startDate}
                    onChange={(value) => setStartDate(value)}
                    placeholder="Select start date"
                    hasError={!!hasError}
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Notice Date (Termination/Resignation Date)
                  </Label>
                  <DatePicker
                    value={noticeDate}
                    onChange={(value) => setNoticeDate(value)}
                    placeholder="Select notice date"
                    hasError={!!hasError}
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    The date when notice is given (not the last working day)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Notice Period Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">
                        Service Period
                      </div>
                      <div className="font-medium">
                        {results.serviceYears} years,{" "}
                        {results.serviceMonths % 12} months
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Employment Status
                      </div>
                      <div className="font-medium">
                        {results.isInProbation ? "Probationary" : "Regular"}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Required Notice Period
                        </span>
                        <span className="font-semibold">
                          {results.requiredWeeks} week
                          {results.requiredWeeks !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Notice Period Starts
                        </span>
                        <span className="font-medium">
                          {fmt(results.noticeStarts)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Day of Employment
                        </span>
                        <span className="text-primary font-semibold">
                          {fmt(results.lastDayOfEmployment)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {results.isInProbation && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Employee is in probationary period. Standard probation
                        notice rules apply.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Enter valid employment start date and notice date to calculate
                  the required notice period.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Policy Information */}
      <div className="mt-8">
        <h2 className="mb-6 text-2xl font-bold lg:text-3xl">
          Notice Period Policy (Article 36 Summary)
        </h2>

        <div className="space-y-3">
          <Accordion type="single" collapsible>
            <AccordionItem value="thresholds">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Service Period Thresholds
              </AccordionTrigger>
              <AccordionContent>
                <ul className="ml-6 list-disc space-y-2 text-base">
                  <li>
                    More than 1 month but not more than 6 months:{" "}
                    <strong>1 week</strong>
                  </li>
                  <li>
                    More than 6 months but not more than 2 years:{" "}
                    <strong>2 weeks</strong>
                  </li>
                  <li>
                    More than 2 years but not more than 4 years:{" "}
                    <strong>4 weeks</strong>
                  </li>
                  <li>
                    More than 4 years but not more than 7 years:{" "}
                    <strong>8 weeks</strong>
                  </li>
                  <li>
                    More than 7 years:{" "}
                    <strong>8 weeks + 1 week per additional year</strong>{" "}
                    (maximum 12 weeks)
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible>
            <AccordionItem value="special-positions">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Special Positions
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base leading-relaxed">
                  For technical, administrative, executive, or managerial
                  positions, longer notice periods may be agreed upon between
                  employer and employee, provided the wage is at least twice the
                  minimum wage.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible>
            <AccordionItem value="important-notes">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Important Notes
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-base leading-relaxed">
                  <p>
                    <strong>Probationary Period:</strong> During probation, 1
                    week notice applies if service exceeds 1 month.
                  </p>
                  <p>
                    <strong>Notice Start:</strong> Notice period begins on the
                    first working day after notice is given (Monday-Friday are
                    working days).
                  </p>
                  <p>
                    <strong>Calculation:</strong> Service periods are calculated
                    from start date to notice date, with partial months
                    considered.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
