import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt.payload';
import { InjectRepository } from '@nestjs/typeorm';
import { Recycler } from 'src/recycler/entities/recycler/recycler.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Recycler) private recyclerRepository: Repository<Recycler>,  // Inject the UserRepository here
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'yourSecretKey', // Replace with a secure key
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    
    // Correct usage of findOne
    const user = await this.recyclerRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user; // This attaches the user to req.user
  }
}
