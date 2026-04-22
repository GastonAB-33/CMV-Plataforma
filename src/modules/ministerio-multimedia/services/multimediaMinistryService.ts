import { InMemoryMultimediaMinistryRepository } from '../repositories/inMemoryMultimediaMinistryRepository';
import { MultimediaMember, MultimediaMinistryRepository, MultimediaShift } from '../types';

export class MultimediaMinistryService {
  constructor(private readonly repository: MultimediaMinistryRepository) {}

  listMembers(): MultimediaMember[] {
    return this.repository.listMembers();
  }

  listShifts(): MultimediaShift[] {
    return this.repository.listShifts();
  }
}

const repository = new InMemoryMultimediaMinistryRepository();

export const multimediaMinistryService = new MultimediaMinistryService(repository);

