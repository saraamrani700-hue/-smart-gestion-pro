import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RappelFiscal } from './entities/rappel-fiscal.entity';
import { CalendrierFiscalService } from './calendrier-fiscal.service';
import { CalendrierFiscalController } from './calendrier-fiscal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RappelFiscal])],
  controllers: [CalendrierFiscalController],
  providers: [CalendrierFiscalService],
  exports: [CalendrierFiscalService],
})
export class CalendrierFiscalModule {}
