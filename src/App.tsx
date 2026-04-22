import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './modules/dashboard/DashboardPage'
import { BrotherList } from './modules/hermanos/BrotherList'
import { BrotherDetail } from './modules/hermanos/BrotherDetail'
import { SeguimientoPage } from './modules/seguimiento/SeguimientoPage'
import { EventsPage } from './modules/events/EventsPage'
import { useAuth } from './hooks/useAuth'

const App = () => {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <MainLayout role={user.role}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/hermanos" element={<BrotherList />} />
          <Route path="/hermanos/:id" element={<BrotherDetail />} />
          <Route path="/tracking" element={<SeguimientoPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;

