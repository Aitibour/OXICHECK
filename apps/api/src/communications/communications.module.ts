import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
import { CommunicationSchedulingService } from './scheduling.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CommunicationsController],
  providers: [CommunicationsService, CommunicationSchedulingService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
