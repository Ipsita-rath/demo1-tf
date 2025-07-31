import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import TerraformBuilder from "@/pages/terraform-builder";
import TerraformCloudPage from "@/pages/terraform-cloud";
import NotFound from "@/pages/not-found";
import securityManager from "@/utils/security";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TerraformBuilder} />
      <Route path="/terraform-cloud" component={TerraformCloudPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize security measures
    securityManager.initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
