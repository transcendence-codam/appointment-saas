import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateServiceDto } from "./dto/create-service.dto.js";
import { UpdateServiceDto } from "./dto/update-service.dto.js";

const SERVICE_SELECT = {
    id: true,
    name: true,
    durationMin: true,
    priceCents: true,
    sortOrder: true,
    isActive: true,
    createdAt: true,
} as const;

@Injectable()
export class ServicesService {
    constructor(private readonly prisma: PrismaService) {}

    // Back office list. Archived services are hidden unless asked for
    list(tenantId: string, includeArchived = false) {
        return this.prisma.service.findMany({
            where: { tenantId, ...(includeArchived? {} : { isActive: true }) },
            orderBy: [{ sortOrder: 'asc'}, { createdAt: 'asc' }],
            select: SERVICE_SELECT,
        });
    }

    // Readable by id when archived (existing appointment still need to show their service)
    async findOne(tenantId: string, id: string) {
        const service = await this.prisma.service.findFirst({
            where: {id, tenantId},
            select: SERVICE_SELECT,
        });
        if (!service)
            throw new NotFoundException('Service not found');
        return service;
    }

    async create(tenantId: string, dto: CreateServiceDto) {
        const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(tenantId));
        return this.prisma.service.create({
            data: {
                tenantId,
                name: dto.name,
                durationMin: dto.durationMin,
                priceCents: dto.priceCents,
                sortOrder,
            },
            select: SERVICE_SELECT,
        });
    }

    async update(tenantId: string, id: string, dto: UpdateServiceDto) {
        const { count } = await this.prisma.service.updateMany({
            where: { id, tenantId },
            data: {
                name: dto.name,
                durationMin: dto.durationMin,
                priceCents: dto.priceCents,
                sortOrder: dto.sortOrder,
            },
        });

        if (count === 0)
            throw new NotFoundException('Service not found');
        return this.findOne(tenantId, id);
    }

    archive(tenantId: string, id: string) {
        return this.setActive(tenantId, id, false);
    }

    restore(tenantId: string, id: string) {
        return this.setActive(tenantId, id, true);
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id);

        const bookings = await this.prisma.appointment.count({ where: { serviceId: id } });
        if (bookings > 0) {
            throw new ConflictException('This service has appointments. Archive it instead of deleting it');
        }
        
        await this.prisma.service.deleteMany({ where: { id, tenantId } });
    }

    // Helper functions

    private async setActive(tenantId: string, id: string, isActive: boolean) {
        const { count } = await this.prisma.service.updateMany({
            where: { id, tenantId },
            data: { isActive },
        });
        if (count === 0)
            throw new NotFoundException('Service not found');
        return this.findOne(tenantId, id);
    }

    private async nextSortOrder(tenantId: string) {
        const { _max } = await this.prisma.service.aggregate({
            where: { tenantId },
            _max: { sortOrder: true },
        });
        return (_max.sortOrder ?? -1) + 1;
    }
}