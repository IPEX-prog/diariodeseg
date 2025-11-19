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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checklists" component={ChecklistList} />
      <Route path="/checklists/new" component={NewChecklist} />
      <Route path="/checklists/:id" component={ChecklistDetail} />
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
