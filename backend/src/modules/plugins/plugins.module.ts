import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginInstalle } from './entities/plugin-installe.entity';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PluginInstalle]), UsersModule],
  controllers: [PluginsController],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsModule {}
