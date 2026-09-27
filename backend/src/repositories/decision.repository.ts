import { prisma } from '../utils/prisma';

export class DecisionRepository {
  async getAll() {
    return prisma.decisionRecommendation.findMany({
      orderBy: { priority: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.decisionRecommendation.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.decisionRecommendation.update({
      where: { id },
      data: { status },
    });
  }
}

export const decisionRepository = new DecisionRepository();
