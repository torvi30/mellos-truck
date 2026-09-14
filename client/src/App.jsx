import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicHome from "./pages/PublicHome.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import QuotesPage from "./pages/QuotesPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import VehiclesPage from "./pages/VehiclesPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import ShowroomPage from "./pages/ShowroomPage.jsx";
import MagicLinksStudioPage from "./pages/MagicLinksStudioPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import WorkshopPage from "./pages/WorkshopPage.jsx";
import LandingEditorPage from "./pages/LandingEditorPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/galeria/:slug" element={<ShowroomPage />} />
        <Route path="/showroom/:slug" element={<ShowroomPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="workshop" element={<WorkshopPage />} />
          <Route path="orders" element={<WorkshopPage />} />
          <Route path="landing" element={<LandingEditorPage />} />
          <Route path="settings" element={<LandingEditorPage />} />
          <Route path="studio" element={<MagicLinksStudioPage />} />
          <Route path="magic-links" element={<MagicLinksStudioPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;