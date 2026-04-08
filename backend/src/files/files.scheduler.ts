import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { File } from '../entities/file.entity';

@Injectable()
export class FilesScheduler {
  private readonly logger = new Logger(FilesScheduler.name);

  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredFiles() {
    this.logger.log('Demarrage de la purge quotidienne des fichiers expires');

    const expiredFiles = await this.filesRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
      },
    });

    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        await fs.unlink(path.join(uploadDir, file.storedName));
      } catch {
        this.logger.warn(
          `Fichier physique deja absent: ${file.storedName}`,
        );
      }

      await this.filesRepository.remove(file);
      deletedCount += 1;
    }

    this.logger.log(`Purge terminee: ${deletedCount} fichier(s) supprime(s)`);
  }
}
