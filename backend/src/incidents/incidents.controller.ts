import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
import { incidentImageMulterOptions } from './multer.config';

@UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get('categories')
  categories() {
    return this.incidentsService.categories();
  }

  @Get()
  findAll(@Query() query: QueryIncidentsDto) {
    return this.incidentsService.findAll(query.category);
  }

  @Get('mine')
  findMine(@CurrentUser() user: RequestUser) {
    return this.incidentsService.findMine(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', incidentImageMulterOptions))
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateIncidentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const imageUrl = file
      ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
      : undefined;
    return this.incidentsService.create(user.userId, dto, imageUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.incidentsService.remove(id, user.userId);
  }
}
