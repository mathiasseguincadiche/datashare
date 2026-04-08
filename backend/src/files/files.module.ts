import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  FORBIDDEN_EXTENSIONS,
  MAX_FILE_SIZE,
} from '../common/constants/file.constants';
import { File } from '../entities/file.entity';
import { FilesController } from './files.controller';
import { FilesScheduler } from './files.scheduler';
import { FilesService } from './files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination:
            configService.get<string>('UPLOAD_DIR') || './uploads',
          filename: (_req, file, cb) => {
            const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
          },
        }),
        limits: {
          fileSize: Number(
            configService.get<string>('MAX_FILE_SIZE') || MAX_FILE_SIZE,
          ),
        },
        fileFilter: (_req, file, cb) => {
          const extension = path.extname(file.originalname).toLowerCase();
          if (FORBIDDEN_EXTENSIONS.includes(extension)) {
            return cb(
              new BadRequestException('Type de fichier non autorise'),
              false,
            );
          }

          cb(null, true);
        },
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, FilesScheduler],
})
export class FilesModule {}
