import { InMemoryEddiSchoolRepository } from '../repositories/inMemoryEddiSchoolRepository';
import { EddiCohort, EddiSchoolRepository, EddiStudentProgress, EddiUpcomingClass } from '../types';

export class EddiSchoolService {
  constructor(private readonly repository: EddiSchoolRepository) {}

  listCohorts(): EddiCohort[] {
    return this.repository.listCohorts();
  }

  listStudentProgress(): EddiStudentProgress[] {
    return this.repository.listStudentProgress();
  }

  listUpcomingClasses(): EddiUpcomingClass[] {
    return this.repository.listUpcomingClasses();
  }
}

const repository = new InMemoryEddiSchoolRepository();

export const eddiSchoolService = new EddiSchoolService(repository);

