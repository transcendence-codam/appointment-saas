import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateServiceDto } from '../services/dto/update-service.dto.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';

const STAFF_SELECT = {
  id: true,
  displayName: true,
  jobTitle: true,
  bio: true,
  photoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, includeArchived = false) {
    return this.prisma.staff.findMany({
      where: { tenantId, ...(includeArchived ? {} : { isActive: true }) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: STAFF_SELECT,
    });
  }

  async findOne(tenantId: string, id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, tenantId },
      select: STAFF_SELECT,
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async create(tenantId: string, dto: CreateStaffDto) {
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(tenantId));
    return this.prisma.staff.create({
      data: {
        tenantId,
        displayName: dto.displayName,
        jobTitle: dto.jobTitle,
        bio: dto.bio,
        photoUrl: dto.photoUrl,
        sortOrder,
      },
      select: STAFF_SELECT,
    });
  }

  async update(tenantId: string, id: string, dto: UpdateStaffDto) {
    const { count } = await this.prisma.staff.updateMany({
      where: { id, tenantId },
      data: {
        displayName: dto.displayName,
        jobTitle: dto.jobTitle,
        bio: dto.bio,
        photoUrl: dto.photoUrl,
        sortOrder: dto.sortOrder,
      },
    });
    if (count === 0) throw new NotFoundException('Staff not found');
    return this.findOne(tenantId, id);
  }

  archive(tenantId: string, id: string) {
    return this.setActive(tenantId, id, true);
  }

  restore(tenantId: string, id: string) {
    return this.setActive(tenantId, id, true);
  }

  // Helper functions
  private async setActive(tenantId: string, id: string, isActive: boolean) {
    const { count } = await this.prisma.staff.updateMany({
      where: { id, tenantId },
      data: { isActive },
    });
    if (count === 0) throw new NotFoundException('Staff not found');
    return this.findOne(tenantId, id);
  }

  private async nextSortOrder(tenantId: string) {
    const { _max } = await this.prisma.staff.aggregate({
      where: { tenantId },
      _max: { sortOrder: true },
    });
    return (_max.sortOrder ?? -1) + 1;
  }
}
