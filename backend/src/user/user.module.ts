// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../recycler/entities/recycler/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],  // Ensure the UserService is exported
})
export class UserModule {}
