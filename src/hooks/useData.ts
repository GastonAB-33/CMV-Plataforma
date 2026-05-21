import { useEffect, useMemo, useState } from 'react';
import { brothersService } from '../services/brothersService';
import { eventsService } from '../services/eventsService';
import { notificationService } from '../services/notifications/notificationService';
import { useAuth } from './useAuth';
import { BrotherProfile } from '../modules/hermanos/types';

export const useData = () => {
  const { user } = useAuth();
  const [brothers, setBrothers] = useState<BrotherProfile[]>(() => brothersService.list());
  const [isLoadingBrothers, setIsLoadingBrothers] = useState(true);
  const events = useMemo(() => eventsService.listVisibleForUser(user), [user]);
  const news = useMemo(() => eventsService.listNewsVisibleForUser(user), [user]);
  const notices = useMemo(() => notificationService.listInternalNotices(), []);

  useEffect(() => {
    let isMounted = true;

    const loadBrothers = async () => {
      try {
        const remote = await brothersService.listAsync();
        if (!isMounted) {
          return;
        }
        setBrothers(remote);
      } finally {
        if (isMounted) {
          setIsLoadingBrothers(false);
        }
      }
    };

    void loadBrothers();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    brothers,
    isLoadingBrothers,
    events,
    news,
    notices,
  };
};
