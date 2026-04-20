import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ForecastBite" },
      { name: "description", content: "Talk to the ForecastBite team. Request a demo or contact sales." },
      { property: "og:title", content: "Contact — ForecastBite" },
      { property: "og:description", content: "Request a demo of ForecastBite AI demand forecasting." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().min(1, "Please select a role"),
  locations: z.string().min(1, "Please select a size"),
  message: z.string().trim().min(10, "Tell us a bit more (min 10 chars)").max(1000, "Message too long"),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormData, string>>;

const initial: FormData = {
  name: "",
  email: "",
  company: "",
  role: "",
  locations: "",
  message: "",
};

function ContactPage() {
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const newErrors: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData;
        if (!newErrors[key]) newErrors[key] = issue.message;
      }
      setErrors(newErrors);
      toast.error("Please fix the errors below.");
      return;
    }

    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setData(initial);
      toast.success("Thanks! We'll be in touch within 1 business day.");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="container mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-[1fr_1.4fr] gap-10 max-w-6xl">
        <div className="space-y-8">
          <div>
            <div className="text-sm uppercase tracking-widest text-primary mb-3">Contact</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Let's forecast together.</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Tell us about your operation and we'll show you a live forecast on your data within 48 hours.
            </p>
          </div>

          <div className="space-y-4">
            <ContactItem icon={Mail} label="Email" value="hello@forecastbite.ai" />
            <ContactItem icon={Phone} label="Phone" value="+1 (415) 555-0142" />
            <ContactItem icon={MapPin} label="Office" value="San Francisco · Berlin · Singapore" />
          </div>
        </div>

        <Card className="p-8 bg-card border-border">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-14 w-14 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Message received.</h2>
              <p className="text-muted-foreground mb-6">
                A member of our team will reach out within 1 business day.
              </p>
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" id="name" error={errors.name}>
                  <Input id="name" value={data.name} onChange={(e) => update("name", e.target.value)} maxLength={100} />
                </Field>
                <Field label="Work email" id="email" error={errors.email}>
                  <Input id="email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
                </Field>
              </div>

              <Field label="Company" id="company" error={errors.company}>
                <Input id="company" value={data.company} onChange={(e) => update("company", e.target.value)} maxLength={120} />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your role" id="role" error={errors.role}>
                  <Select value={data.role} onValueChange={(v) => update("role", v)}>
                    <SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner / Founder</SelectItem>
                      <SelectItem value="ops">Operations</SelectItem>
                      <SelectItem value="data">Data / Engineering</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Number of locations" id="locations" error={errors.locations}>
                  <Select value={data.locations} onValueChange={(v) => update("locations", v)}>
                    <SelectTrigger id="locations"><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Just 1</SelectItem>
                      <SelectItem value="2-10">2 – 10</SelectItem>
                      <SelectItem value="11-50">11 – 50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="How can we help?" id="message" error={errors.message}>
                <Textarea
                  id="message"
                  rows={5}
                  value={data.message}
                  onChange={(e) => update("message", e.target.value)}
                  maxLength={1000}
                  placeholder="Tell us about your business and what you'd like to forecast."
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">{data.message.length}/1000</div>
              </Field>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground border-0 shadow-[var(--shadow-glow)] hover:opacity-90"
              >
                {submitting ? "Sending…" : "Request demo"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We respect your inbox. No spam, ever.
              </p>
            </form>
          )}
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
