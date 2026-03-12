import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { I18nProvider } from "@/components/I18nProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";

// Critical path — load immediately
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SigningPage from "./pages/SigningPage";
import GroupSigningPage from "./pages/GroupSigningPage";
import NotFound from "./pages/NotFound";

// Lazy-load everything else for faster initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Templates = lazy(() => import("./pages/Templates"));
const TemplateEditor = lazy(() => import("./pages/TemplateEditor"));
const Envelopes = lazy(() => import("./pages/Envelopes"));
const EnvelopeDetail = lazy(() => import("./pages/EnvelopeDetail"));
const NewEnvelope = lazy(() => import("./pages/NewEnvelope"));
const Settings = lazy(() => import("./pages/Settings"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BulkSend = lazy(() => import("./pages/BulkSend"));
const CompletionCertificate = lazy(() => import("./pages/CompletionCertificate"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Docs = lazy(() => import("./pages/Docs"));
const DocsArticle = lazy(() => import("./pages/DocsArticle"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const MarketplaceIntegration = lazy(() => import("./pages/MarketplaceIntegration"));
const AdminCredits = lazy(() => import("./pages/AdminCredits"));
const SeoLanding = lazy(() => import("./pages/SeoLanding"));
const KioskPage = lazy(() => import("./pages/KioskPage"));
const WaiverSoftwarePage = lazy(() => import("./pages/seo/WaiverSoftwarePage"));
const RentalWaiverSoftwarePage = lazy(() => import("./pages/seo/RentalWaiverSoftwarePage"));
const IndustriesHubPage = lazy(() => import("./pages/seo/IndustriesHubPage"));
const WaiverTemplatesHubPage = lazy(() => import("./pages/seo/WaiverTemplatesHubPage"));
const WaiverLawsHubPage = lazy(() => import("./pages/seo/WaiverLawsHubPage"));
const CompareHubPage = lazy(() => import("./pages/seo/CompareHubPage"));
const CompetitorAltPage = lazy(() => import("./pages/seo/CompetitorAltPage"));
const PricingPublicPage = lazy(() => import("./pages/seo/PricingPublicPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const LazyFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <I18nProvider>
        <AuthProvider>
          <ErrorBoundary fallbackRoute="/dashboard">
          <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign/:token" element={<SigningPage />} />
            <Route path="/waiver/:groupToken" element={<GroupSigningPage />} />
            <Route path="/waiver/kiosk/:templateId" element={<KioskPage />} />
            <Route path="/my-waivers" element={<CustomerPortal />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:articleId" element={<DocsArticle />} />

            {/* SEO Pillar Pages (public) */}
            <Route path="/waiver-software" element={<WaiverSoftwarePage />} />
            <Route path="/rental-waiver-software" element={<RentalWaiverSoftwarePage />} />
            <Route path="/industries" element={<IndustriesHubPage />} />
            <Route path="/waiver-templates" element={<WaiverTemplatesHubPage />} />
            <Route path="/waiver-laws" element={<WaiverLawsHubPage />} />
            <Route path="/compare" element={<CompareHubPage />} />
            <Route path="/pricing-info" element={<PricingPublicPage />} />
            <Route path="/alternatives/:slug" element={<CompetitorAltPage />} />

            {/* Protected dashboard routes */}
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
            <Route path="/admin/credits" element={<AdminRoute><AdminCredits /></AdminRoute>} />

            {/* SEO vertical/niche landing pages */}
            <Route path="/waivers/:slug" element={<SeoLanding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
