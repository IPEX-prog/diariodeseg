import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChecklistList from "./pages/ChecklistList";
import NewChecklist from "./pages/NewChecklist";
import ChecklistDetail from "./pages/ChecklistDetail";
import EPIChecklistList from "./pages/EPIChecklistList";
import NewEPIChecklist from "./pages/NewEPIChecklist";
import EPIChecklistDetail from "./pages/EPIChecklistDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checklists" component={ChecklistList} />
      <Route path="/checklists/new" component={NewChecklist} />
      <Route path="/checklists/:id" component={ChecklistDetail} />
      <Route path="/epi" component={EPIChecklistList} />
      <Route path="/epi/new" component={NewEPIChecklist} />
      <Route path="/epi/:id" component={EPIChecklistDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
