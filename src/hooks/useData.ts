import { useMemo } from 'react';
import { brothersService } from '../services/brothersService';
import { eventsService } from '../services/eventsService';
import { notificationService } from '../services/notifications/notificationService';
import { useAuth } from './useAuth';

export const useData = () => {
  const { user } = useAuth();
  const brothers = useMemo(() => brothersService.list(), []);
  const events = useMemo(() => eventsService.listVisibleForUser(user), [user]);
  const news = useMemo(() => eventsService.listNewsVisibleForUser(user), [user]);
  const notices = useMemo(() => notificationService.listInternalNotices(), []);

  return {
    brothers,
    events,
    news,
    notices,
  };
};
