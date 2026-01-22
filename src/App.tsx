import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import ProtectedRoute from "./components/dashboard/ProtectedRoute";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Pricing from "./pages/Pricing";
import UseCases from "./pages/UseCases";
import Demo from "./pages/Demo";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import ClientsPage from "./pages/dashboard/ClientsPage";
import ClientDetailPage from "./pages/dashboard/ClientDetailPage";
import MeetingsPage from "./pages/dashboard/MeetingsPage";
import CalendarViewPage from "./pages/dashboard/CalendarViewPage";
import NewsPage from "./pages/dashboard/NewsPage";
import AIBriefsPage from "./pages/dashboard/AIBriefsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import RequirementsPage from "./pages/dashboard/RequirementsPage";
import DataExportPage from "./pages/dashboard/DataExportPage";
import AIAgentsPage from "./pages/dashboard/AIAgentsPage";
import FeedbackAnalyticsPage from "./pages/dashboard/FeedbackAnalyticsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<Product />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/use-cases" element={<UseCases />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/contact" element={<Contact />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />
                <Route path="meetings" element={<MeetingsPage />} />
                <Route path="calendar" element={<CalendarViewPage />} />
                <Route path="requirements" element={<RequirementsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="ai-briefs" element={<AIBriefsPage />} />
                <Route path="ai-agents" element={<AIAgentsPage />} />
                <Route path="export" element={<DataExportPage />} />
                <Route path="feedback" element={<FeedbackAnalyticsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
