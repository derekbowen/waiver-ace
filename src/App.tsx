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

// Public / SEO pages — static imports so crawlers index them
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SigningPage from "./pages/SigningPage";
import GroupSigningPage from "./pages/GroupSigningPage";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Docs from "./pages/Docs";
import DocsArticle from "./pages/DocsArticle";
import CustomerPortal from "./pages/CustomerPortal";
import Unsubscribe from "./pages/Unsubscribe";
import Updates from "./pages/Updates";
import FindMyWaiver from "./pages/FindMyWaiver";
import SeoLanding from "./pages/SeoLanding";
import WaiverSoftwarePage from "./pages/seo/WaiverSoftwarePage";
import RentalWaiverSoftwarePage from "./pages/seo/RentalWaiverSoftwarePage";
import IndustriesHubPage from "./pages/seo/IndustriesHubPage";
import WaiverTemplatesHubPage from "./pages/seo/WaiverTemplatesHubPage";
import WaiverLawsHubPage from "./pages/seo/WaiverLawsHubPage";
import CompareHubPage from "./pages/seo/CompareHubPage";
import CompetitorAltPage from "./pages/seo/CompetitorAltPage";
import PricingPublicPage from "./pages/seo/PricingPublicPage";
import BlogHubPage from "./pages/seo/BlogHubPage";
import BlogArticlePage from "./pages/seo/BlogArticlePage";
import ContractScannerPage from "./pages/seo/ContractScannerPage";
import IndustryDetailPage from "./pages/seo/IndustryDetailPage";
import WaiverTemplatePage from "./pages/seo/WaiverTemplatePage";
import WaiverLawStatePage from "./pages/seo/WaiverLawStatePage";
import IndustryStateMatrixPage from "./pages/seo/IndustryStateMatrixPage";
import EmbedGenerator from "./pages/embed/EmbedGenerator";
import EmbedSign from "./pages/embed/EmbedSign";

// Authenticated dashboard pages — lazy-loaded (behind login, not crawled)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Templates = lazy(() => import("./pages/Templates"));
const TemplateEditor = lazy(() => import("./pages/TemplateEditor"));
const Envelopes = lazy(() => import("./pages/Envelopes"));
const EnvelopeDetail = lazy(() => import("./pages/EnvelopeDetail"));
const NewEnvelope = lazy(() => import("./pages/NewEnvelope"));
const Settings = lazy(() => import("./pages/Settings"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const PhotoSell = lazy(() => import("./pages/PhotoSell"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BulkSend = lazy(() => import("./pages/BulkSend"));
const CompletionCertificate = lazy(() => import("./pages/CompletionCertificate"));
const Pricing = lazy(() => import("./pages/Pricing"));
const MarketplaceIntegration = lazy(() => import("./pages/MarketplaceIntegration"));
const AdminCredits = lazy(() => import("./pages/AdminCredits"));
const KioskPage = lazy(() => import("./pages/KioskPage"));
const ContractScanner = lazy(() => import("./pages/ContractScanner"));
const Documents = lazy(() => import("./pages/Documents"));
const CreditDispute = lazy(() => import("./pages/CreditDispute"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const ListingAnalyzer = lazy(() => import("./pages/ListingAnalyzer"));

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
            {/* Public / SEO — statically loaded for crawlers */}
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
            <Route path="/waiver-software" element={<WaiverSoftwarePage />} />
            <Route path="/rental-waiver-software" element={<RentalWaiverSoftwarePage />} />
            <Route path="/industries" element={<IndustriesHubPage />} />
            <Route path="/industries/:industrySlug/state/:stateSlug" element={<IndustryStateMatrixPage />} />
            <Route path="/industries/:slug" element={<IndustryDetailPage />} />
            <Route path="/waiver-templates" element={<WaiverTemplatesHubPage />} />
            <Route path="/waiver-templates/:slug" element={<WaiverTemplatePage />} />
            <Route path="/waiver-laws" element={<WaiverLawsHubPage />} />
            <Route path="/waiver-laws/:slug" element={<WaiverLawStatePage />} />
            <Route path="/compare" element={<CompareHubPage />} />
            <Route path="/pricing-info" element={<PricingPublicPage />} />
            <Route path="/alternatives/:slug" element={<CompetitorAltPage />} />
            <Route path="/waivers/:slug" element={<SeoLanding />} />
            <Route path="/blog" element={<BlogHubPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/contract-scanner-info" element={<ContractScannerPage />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/find-my-waiver" element={<FindMyWaiver />} />
            <Route path="/embed/generator" element={<EmbedGenerator />} />
            <Route path="/embed/sign" element={<EmbedSign />} />

            {/* Protected dashboard — lazy-loaded (not crawled) */}
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
            <Route path="/photosell" element={<ProtectedRoute><PhotoSell /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="/contract-scanner" element={<ProtectedRoute><ContractScanner /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/credit-dispute" element={<ProtectedRoute><CreditDispute /></ProtectedRoute>} />
            <Route path="/audit-log" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
            <Route path="/listing-analyzer" element={<ProtectedRoute><ListingAnalyzer /></ProtectedRoute>} />
            <Route path="/admin/credits" element={<AdminRoute><AdminCredits /></AdminRoute>} />

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
