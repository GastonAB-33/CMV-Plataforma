import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RedirectIfAuthenticated, RequireAuth } from './components/routing/RouteGuards';
import { useAuth } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { EscuelaEddiPage } from './modules/escuela-eddi/EscuelaEddiPage';
import { EscuelaEdemPage } from './modules/escuela-edem/EscuelaEdemPage';
import { EventsPage } from './modules/events/EventsPage';
import { BrotherDetail } from './modules/hermanos/BrotherDetail';
import { BrotherList } from './modules/hermanos/BrotherList';
import { MinisterioAdoracionPage } from './modules/ministerio-adoracion/MinisterioAdoracionPage';
import { MinisterioMisericordiaPage } from './modules/ministerio-misericordia/MinisterioMisericordiaPage';
import { MinisterioMultimediaPage } from './modules/ministerio-multimedia/MinisterioMultimediaPage';
import { SeguimientoPage } from './modules/seguimiento/SeguimientoPage';
import { UsersConfigPage } from './modules/configuracion/UsersConfigPage';
import { CellsConfigPage } from './modules/configuracion/CellsConfigPage';
import { MarriagesConfigPage } from './modules/configuracion/MarriagesConfigPage';
import { DiscipuladoConfigPage } from './modules/configuracion/DiscipuladoConfigPage';
import { ImportadorPage } from './modules/importador/ImportadorPage';
import { User } from './types';

import { HomePage } from './modules/nCMV-Plataforma/HomePage';
import { CelulasDirectoryPage } from './modules/celulas/CelulasDirectoryPage';

const ProtectedAppRoutes = ({ user }: { user: User }) => (
  <MainLayout user={user}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/celulas" element={<CelulasDirectoryPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/hermanos" element={<BrotherList />} />
      <Route path="/hermanos/:id" element={<BrotherDetail />} />
      <Route path="/tracking" element={<SeguimientoPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/escuela-eddi" element={<EscuelaEddiPage />} />
      <Route path="/escuela-edem" element={<EscuelaEdemPage />} />
      <Route path="/ministerio-adoracion" element={<MinisterioAdoracionPage />} />
      <Route path="/ministerio-multimedia" element={<MinisterioMultimediaPage />} />
      <Route path="/ministerio-misericordia" element={<MinisterioMisericordiaPage />} />
      <Route path="/configuracion/usuarios" element={<UsersConfigPage />} />
      <Route path="/configuracion/celulas" element={<CellsConfigPage />} />
      <Route path="/configuracion/matrimonios" element={<MarriagesConfigPage />} />
      <Route path="/configuracion/discipulado" element={<DiscipuladoConfigPage />} />
      <Route path="/importador" element={<ImportadorPage />} />
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
              <ProtectedAppRoutes user={user} />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
