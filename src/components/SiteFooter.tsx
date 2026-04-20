import { Link } from "@tanstack/react-router";
import { Utensils } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10 mt-16">
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            <span className="font-bold">ForecastBite</span>
          </div>
          <p className="text-muted-foreground">
            AI-powered demand forecasting for the food delivery industry.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Product</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/predictor" className="hover:text-foreground">Predictor</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Legal</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
        © 2026 ForecastBite. All rights reserved.
      </div>
    </footer>
  );
}
