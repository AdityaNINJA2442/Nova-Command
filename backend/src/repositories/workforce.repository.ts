import { prisma } from '../utils/prisma';

export class WorkforceRepository {
  async getAllEmployees() {
    return prisma.employee.findMany();
  }

  async getEmployeeById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: { workOrders: true },
    });
  }

  async getAllUsers() {
    return prisma.appUser.findMany();
  }

  async getUserById(id: string) {
    return prisma.appUser.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    id: string;
    name: string;
    email: string;
    role: string;
    title: string;
    initials: string;
    department: string;
    avatarBg: string;
    description: string;
  }) {
    return prisma.appUser.create({
      data,
    });
  }

  async updateUserRole(id: string, role: string) {
    return prisma.appUser.update({
      where: { id },
      data: { role },
    });
  }
}

export const workforceRepository = new WorkforceRepository();
