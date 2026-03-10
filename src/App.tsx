import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { I18nProvider } from "@/components/I18nProvider";
import Landing from "./pages/Landing";
import KioskPage from "./pages/KioskPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import TemplateEditor from "./pages/TemplateEditor";
import Envelopes from "./pages/Envelopes";
import EnvelopeDetail from "./pages/EnvelopeDetail";
import NewEnvelope from "./pages/NewEnvelope";
import SigningPage from "./pages/SigningPage";
import GroupSigningPage from "./pages/GroupSigningPage";
import Settings from "./pages/Settings";
import ApiKeys from "./pages/ApiKeys";
import Webhooks from "./pages/Webhooks";
import TeamMembers from "./pages/TeamMembers";
import Analytics from "./pages/Analytics";
import BulkSend from "./pages/BulkSend";
import CompletionCertificate from "./pages/CompletionCertificate";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Docs from "./pages/Docs";
import CustomerPortal from "./pages/CustomerPortal";
import MarketplaceIntegration from "./pages/MarketplaceIntegration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <I18nProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign/:token" element={<SigningPage />} />
            <Route path="/waiver/:groupToken" element={<GroupSigningPage />} />
            <Route path="/my-waivers" element={<CustomerPortal />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/templates/new" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
            <Route path="/templates/:id" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
            <Route path="/envelopes" element={<ProtectedRoute><Envelopes /></ProtectedRoute>} />
            <Route path="/envelopes/new" element={<ProtectedRoute><NewEnvelope /></ProtectedRoute>} />
            <Route path="/envelopes/:id" element={<ProtectedRoute><EnvelopeDetail /></ProtectedRoute>} />
            <Route path="/envelopes/:id/certificate" element={<ProtectedRoute><CompletionCertificate /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
            <Route path="/settings/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
            <Route path="/settings/team" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
            <Route path="/settings/marketplace" element={<ProtectedRoute><MarketplaceIntegration /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/envelopes/bulk" element={<ProtectedRoute><BulkSend /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
