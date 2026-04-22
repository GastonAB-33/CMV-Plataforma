import { MOCK_EVENTS } from '../data/mocks';
import { Event } from '../types';

export const eventsService = {
  list(): Event[] {
    return MOCK_EVENTS;
  },
};

