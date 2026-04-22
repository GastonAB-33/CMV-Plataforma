import { InMemoryWorshipMinistryRepository } from '../repositories/inMemoryWorshipMinistryRepository';
import { WorshipMember, WorshipMinistryRepository, WorshipRehearsal, WorshipSetlistSong } from '../types';

export class WorshipMinistryService {
  constructor(private readonly repository: WorshipMinistryRepository) {}

  listMembers(): WorshipMember[] {
    return this.repository.listMembers();
  }

  listSetlistSongs(): WorshipSetlistSong[] {
    return this.repository.listSetlistSongs();
  }

  listRehearsals(): WorshipRehearsal[] {
    return this.repository.listRehearsals();
  }
}

const repository = new InMemoryWorshipMinistryRepository();

export const worshipMinistryService = new WorshipMinistryService(repository);

