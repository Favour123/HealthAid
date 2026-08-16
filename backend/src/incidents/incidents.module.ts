import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentsGateway } from './incidents.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsGateway],
})
export class IncidentsModule {}
