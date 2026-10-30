import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EscuelasBentoMenu } from './components/EscuelasBentoMenu';
import { SchoolDetailView } from './components/SchoolDetailView';
import { MaterialEstudioView } from './components/MaterialEstudioView';
import { SchoolType } from './types';
import { Toast } from '../../components/ui/Toast';

export const EscuelasPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSchool = searchParams.get('escuela') as SchoolType | null;

  const validSchools: SchoolType[] = ['eddi-1', 'eddi-2', 'eddi-3', 'edem', 'material-estudio'];
  const currentSchool = rawSchool && validSchools.includes(rawSchool) ? rawSchool : null;

  const [toast, setToast] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const handleSelectSchool = (school: SchoolType) => {
    setSearchParams({ escuela: school });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMenu = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNotify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text: message, type });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-black text-slate-900 dark:text-white p-3 sm:p-6 md:p-8 space-y-6 transition-colors">
      {currentSchool === null ? (
        <EscuelasBentoMenu onSelectSchool={handleSelectSchool} />
      ) : currentSchool === 'material-estudio' ? (
        <MaterialEstudioView
          onBackToMenu={handleBackToMenu}
          onSwitchSchool={handleSelectSchool}
          onNotify={handleNotify}
        />
      ) : (
        <SchoolDetailView
          schoolType={currentSchool}
          onBackToMenu={handleBackToMenu}
          onSwitchSchool={handleSelectSchool}
          onNotify={handleNotify}
        />
      )}

      {toast && (
        <Toast
          message={toast.text}
          isVisible={true}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EscuelasPage;
