import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Format email invalide' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123', minLength: 8 })
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caracteres',
  })
  password: string;
}
