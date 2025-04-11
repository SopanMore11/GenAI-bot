import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import ChatPDF from "@/pages/ChatPDF";
import ChatURL from "@/pages/ChatURL";
import ErrorDecoder from "@/pages/ErrorDecoder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat-pdf" component={ChatPDF} />
      <Route path="/chat-url" component={ChatURL} />
      <Route path="/error-decoder" component={ErrorDecoder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
