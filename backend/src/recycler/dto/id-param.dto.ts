import { IsInt, IsPositive } from 'class-validator';

export class IdParamDto {
  @IsInt()            // Validates that the ID is an integer
  @IsPositive()       // Ensures the ID is a positive number
  id: number;
}