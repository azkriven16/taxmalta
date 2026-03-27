"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";

export function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(
        "https://formsubmit.co/ajax/ciptaxpro@gmail.com",
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        },
      );

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold lg:text-4xl">Contact Us</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Have a question or feedback? We&apos;d love to hear from you.
        </p>
        <a
          href="mailto:ciptaxpro@gmail.com"
          className="text-primary mt-1 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          <Mail className="h-4 w-4" />
          ciptaxpro@gmail.com
        </a>
      </div>

      <div className="bg-card rounded-2xl border p-6 shadow-lg md:p-8">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <p className="text-lg font-semibold">Message sent!</p>
              <p className="text-muted-foreground text-sm">
                We&apos;ll get back to you as soon as possible.
              </p>
            </div>
            <Button variant="outline" onClick={() => setStatus("idle")}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="_captcha" value="false" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Smith"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="e.g. Question about the late penalty calculator"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Write your message here..."
                required
                rows={5}
                className="resize-none"
              />
            </div>

            {status === "error" && (
              <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
                <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                <p className="text-destructive text-sm">
                  Something went wrong. Please try again or email us directly at{" "}
                  <a
                    href="mailto:ciptaxpro@gmail.com"
                    className="font-medium underline"
                  >
                    ciptaxpro@gmail.com
                  </a>
                  .
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                "Sending…"
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
