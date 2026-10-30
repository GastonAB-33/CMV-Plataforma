import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CulturaCongregacionalModal } from './components/CulturaCongregacionalModal';

export const CulturaCongregacionalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CulturaCongregacionalModal
      isOpen={true}
      onClose={() => navigate('/')}
      isStandalonePage={true}
    />
  );
};
