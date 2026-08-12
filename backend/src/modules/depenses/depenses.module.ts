import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Depense } from './entities/depense.entity';
import { DepensesService } from './depenses.service';
import { DepensesController } from './depenses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Depense])],
  controllers: [DepensesController],
  providers: [DepensesService],
  exports: [DepensesService],
})
export class DepensesModule {}
