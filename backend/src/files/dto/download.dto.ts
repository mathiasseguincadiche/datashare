import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DownloadDto {
  @ApiPropertyOptional({
    example: 'secret123',
    description: 'Mot de passe du fichier si la protection est active',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
