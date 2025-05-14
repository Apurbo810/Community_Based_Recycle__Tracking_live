import { IsString, IsEmail, Matches, IsEnum, IsInt, Min } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['male','female','other'], { message: 'Invalid'})
  gender: string;
  
  @IsString()
  password: string;

  @IsString()
  confirmPassword: string;

  @IsEnum(['Admin', 'recycler', 'Organization', 'Citizen'], { message: 'Invalid role' })
  role: string;

  @IsInt()
  @Min(18)
  age: number;
}
