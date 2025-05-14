import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Recycler } from '../recycler/entities/recycler/recycler.entity'; // Recycler entity
import { RegisterDto } from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as validator from 'validator';  // A validation library for email format

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Recycler) // Inject Recycler repository
    private readonly recyclerRepository: Repository<Recycler>,
    private readonly jwtService: JwtService,  // Inject JwtService here
  ) { 
    console.log('JWT Service:', this.jwtService);
  }

  // Register new user
  async register(registerDto: RegisterDto): Promise<Recycler> {
    const { name, email, password, confirmPassword, role, age,gender } = registerDto;
  
    // Ensure passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
  
    // Validate that the role is correct
    const validRoles = ['Admin', 'recycler', 'Organization', 'Citizen'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const validgender = ['male', 'female', 'other'];
    if (!validgender.includes(gender)) {
      throw new BadRequestException('Invalid role');
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
  
    // Check if email already exists
    const existingUser = await this.recyclerRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
  
    // Hash the password
    const hashedPassword = await this.hashPassword(password);
  
    // Create the Recycler user
    const recycler = this.recyclerRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      age,
      earning: 0, // Default value for earnings
      wallet: 0, // Default value for wallet
      acceptEvents: 0, // Default value
      rejectEvents: 0, // Default value
      dailyEarnings: {}, // Default empty object
      dailyProgress: {}, // Default empty object
      gender,
    });
  
    try {
      // Save the user to the recycler table
      return await this.recyclerRepository.save(recycler);
    } catch (error) {
      console.error('Registration Error:', error);  // Log the error for debugging
      throw new BadRequestException('Failed to register Recycler');
    }
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.recyclerRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials (email)');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials (password)');

    const payload = { id: user.id, role: user.role };
    return {
      token: this.generateJwtToken(payload),
      role: user.role,
    };
  }

  // Helper function to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Helper function to generate JWT token
  private generateJwtToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: '1h', // Set an expiration time for the token
    });
  }
}
