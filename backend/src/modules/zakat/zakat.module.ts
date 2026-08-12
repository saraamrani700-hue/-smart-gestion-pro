import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculZakat } from './entities/calcul-zakat.entity';
import { ZakatService } from './zakat.service';
import { ZakatController } from './zakat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CalculZakat])],
  controllers: [ZakatController],
  providers: [ZakatService],
  exports: [ZakatService],
})
export class ZakatModule {}
