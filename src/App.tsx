import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FilterProvider } from "@/contexts/FilterContext";
import AppShell from "./components/AppShell";
import Demo from "./pages/Demo";
import Search from "./pages/Search";
import Items from "./pages/Items";
import Suppliers from "./pages/Suppliers";
import SupplierProfile from "./pages/SupplierProfile";
import SupplierUpload from "./pages/SupplierUpload";
import ItemDetail from "./pages/ItemDetail";
import Compare from "./pages/Compare";
import ImportBOM from "./pages/ImportBOM";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FilterProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Demo />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/search" element={<Search />} />
              <Route path="/items" element={<Items />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/supplier/:id" element={<SupplierProfile />} />
              <Route path="/supplier-upload/:auditId?" element={<SupplierUpload />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/import" element={<ImportBOM />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </FilterProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
