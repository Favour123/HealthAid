import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IncidentCategory } from './incident-category';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentsGateway } from './incidents.gateway';

const reporterSelect = {
  select: { id: true, name: true },
};

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: IncidentsGateway,
  ) {}

  async create(userId: string, dto: CreateIncidentDto, imageUrl?: string) {
    const incident = await this.prisma.incident.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        imageUrl,
        reporterId: userId,
      },
      include: { reporter: reporterSelect },
    });

    this.gateway.emitNewIncident(incident);
    return incident;
  }

  findAll(category?: IncidentCategory) {
    return this.prisma.incident.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { reporter: reporterSelect },
    });
  }

  findMine(userId: string) {
    return this.prisma.incident.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' },
      include: { reporter: reporterSelect },
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: { reporter: reporterSelect },
    });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    return incident;
  }

  async remove(id: string, userId: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    if (incident.reporterId !== userId) {
      throw new ForbiddenException('You can only delete your own reports');
    }
    await this.prisma.incident.delete({ where: { id } });
    return { success: true };
  }

  categories() {
    return Object.values(IncidentCategory);
  }
}
