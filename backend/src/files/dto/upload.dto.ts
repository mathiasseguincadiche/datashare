import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min, MinLength } from 'class-validator';

export class UploadOptionsDto {
  @ApiPropertyOptional({
    example: 3,
    description: 'Duree avant expiration en jours (1 a 7)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  expiresInDays?: number;

  @ApiPropertyOptional({
    example: 'secret123',
    description: 'Mot de passe optionnel pour proteger le telechargement',
  })
  @IsOptional()
  @MinLength(6, {
    message: 'Le mot de passe du fichier doit faire au moins 6 caracteres',
  })
  password?: string;
}
