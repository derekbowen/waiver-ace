import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import TemplateEditor from "./pages/TemplateEditor";
import Envelopes from "./pages/Envelopes";
import EnvelopeDetail from "./pages/EnvelopeDetail";
import NewEnvelope from "./pages/NewEnvelope";
import SigningPage from "./pages/SigningPage";
import Settings from "./pages/Settings";
import ApiKeys from "./pages/ApiKeys";
import Webhooks from "./pages/Webhooks";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign/:token" element={<SigningPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/templates/new" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
            <Route path="/templates/:id" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
            <Route path="/envelopes" element={<ProtectedRoute><Envelopes /></ProtectedRoute>} />
            <Route path="/envelopes/new" element={<ProtectedRoute><NewEnvelope /></ProtectedRoute>} />
            <Route path="/envelopes/:id" element={<ProtectedRoute><EnvelopeDetail /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
            <Route path="/settings/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
