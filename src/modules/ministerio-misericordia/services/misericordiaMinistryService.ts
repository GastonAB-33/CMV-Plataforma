import { InMemoryMisericordiaMinistryRepository } from '../repositories/inMemoryMisericordiaMinistryRepository';
import { MisericordiaMember, MisericordiaMessage, MisericordiaMinistryRepository, MisericordiaOutreach } from '../types';

export class MisericordiaMinistryService {
  constructor(private readonly repository: MisericordiaMinistryRepository) {}

  listMembers(): MisericordiaMember[] {
    return this.repository.listMembers();
  }

  listMessages(): MisericordiaMessage[] {
    return this.repository.listMessages();
  }

  listOutreaches(): MisericordiaOutreach[] {
    return this.repository.listOutreaches();
  }
}

const repository = new InMemoryMisericordiaMinistryRepository();

export const misericordiaMinistryService = new MisericordiaMinistryService(repository);
