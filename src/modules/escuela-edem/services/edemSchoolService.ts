import { InMemoryEdemSchoolRepository } from '../repositories/inMemoryEdemSchoolRepository';
import { EdemCohort, EdemSchoolRepository, EdemStudentProgress, EdemUpcomingClass } from '../types';

export class EdemSchoolService {
  constructor(private readonly repository: EdemSchoolRepository) {}

  listCohorts(): EdemCohort[] {
    return this.repository.listCohorts();
  }

  listStudentProgress(): EdemStudentProgress[] {
    return this.repository.listStudentProgress();
  }

  listUpcomingClasses(): EdemUpcomingClass[] {
    return this.repository.listUpcomingClasses();
  }
}

const edemSchoolRepository = new InMemoryEdemSchoolRepository();

export const edemSchoolService = new EdemSchoolService(edemSchoolRepository);
