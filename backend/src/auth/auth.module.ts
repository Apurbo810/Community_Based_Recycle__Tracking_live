import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { Recycler } from 'src/recycler/entities/recycler/recycler.entity';
import { RecyclerService } from 'src/recycler/recycler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recycler]),
    PassportModule,
    JwtModule.register({
      secret: 'yourSecretKey', // Replace with a secure key
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

})
export class AuthModule {}
