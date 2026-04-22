import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RedirectIfAuthenticated, RequireAuth } from './components/routing/RouteGuards';
import { useAuth } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { EscuelaEddiPage } from './modules/escuela-eddi/EscuelaEddiPage';
import { EventsPage } from './modules/events/EventsPage';
import { BrotherDetail } from './modules/hermanos/BrotherDetail';
import { BrotherList } from './modules/hermanos/BrotherList';
import { MinisterioAdoracionPage } from './modules/ministerio-adoracion/MinisterioAdoracionPage';
import { MinisterioMisericordiaPage } from './modules/ministerio-misericordia/MinisterioMisericordiaPage';
import { MinisterioMultimediaPage } from './modules/ministerio-multimedia/MinisterioMultimediaPage';
import { SeguimientoPage } from './modules/seguimiento/SeguimientoPage';
import { Role } from './types';

const ProtectedAppRoutes = ({ role }: { role: Role }) => (
  <MainLayout role={role}>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/hermanos" element={<BrotherList />} />
      <Route path="/hermanos/:id" element={<BrotherDetail />} />
      <Route path="/tracking" element={<SeguimientoPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/escuela-eddi" element={<EscuelaEddiPage />} />
      <Route path="/ministerio-adoracion" element={<MinisterioAdoracionPage />} />
      <Route path="/ministerio-multimedia" element={<MinisterioMultimediaPage />} />
      <Route path="/ministerio-misericordia" element={<MinisterioMisericordiaPage />} />
      <Route path="/ministerio-misreicordia" element={<MinisterioMisericordiaPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </MainLayout>
);

const App = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ProtectedAppRoutes role={user.role} />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
