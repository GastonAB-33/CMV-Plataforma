import { useMemo } from 'react';
import { brothersService } from '../services/brothersService';
import { eventsService } from '../services/eventsService';
import { notificationService } from '../services/notifications/notificationService';

export const useData = () => {
  const brothers = useMemo(() => brothersService.list(), []);
  const events = useMemo(() => eventsService.list(), []);
  const notices = useMemo(() => notificationService.listInternalNotices(), []);

  return {
    brothers,
    events,
    notices,
  };
};

