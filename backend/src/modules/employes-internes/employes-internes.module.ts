import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeInterne } from './entities/employe-interne.entity';
import { EmployesInternesService } from './employes-internes.service';
import { EmployesInternesController } from './employes-internes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeInterne])],
  controllers: [EmployesInternesController],
  providers: [EmployesInternesService],
  exports: [EmployesInternesService],
})
export class EmployesInternesModule {}
