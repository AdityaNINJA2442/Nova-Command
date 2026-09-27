import { prisma } from '../utils/prisma';

export class WhatIfRepository {
  async getActiveScenario() {
    return prisma.whatIfScenario.findFirst({
      where: { id: 'SCENARIO-01' },
    });
  }

  async updateScenario(id: string, data: {
    parametersJson?: string;
    simulatedMetricsJson?: string;
    consequencesJson?: string;
    impactChainJson?: string;
  }) {
    return prisma.whatIfScenario.update({
      where: { id },
      data,
    });
  }
}

export const whatIfRepository = new WhatIfRepository();
