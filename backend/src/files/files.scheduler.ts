import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import * as fs from "fs/promises";
import * as path from "path";
import { File } from "../entities/file.entity";

@Injectable()
export class FilesScheduler {
  private readonly logger = new Logger(FilesScheduler.name);

  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Purge quotidienne (un seul passage a minuit) :
   *  1. Supprime les fichiers expires (BDD + disque).
   *  2. Balaye les orphelins disque (fichiers presents dans uploads/
   *     mais sans ligne en base) — couvre les rollbacks incomplets
   *     et les suppressions d'utilisateurs en cascade.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredAndOrphanFiles() {
    this.logger.log("Demarrage de la purge quotidienne");

    const uploadDir =
      this.configService.get<string>("UPLOAD_DIR") || "./uploads";

    // 1) Fichiers expires (BDD + disque)
    const expiredFiles = await this.filesRepository.find({
      where: { expiresAt: LessThan(new Date()) },
    });

    let expiredCount = 0;
    for (const file of expiredFiles) {
      try {
        await fs.unlink(path.join(uploadDir, file.storedName));
      } catch {
        this.logger.warn(
          `Fichier physique deja absent: ${file.storedName}`,
        );
      }
      await this.filesRepository.remove(file);
      expiredCount += 1;
    }

    // 2) Orphelins disque (presents sur le FS mais plus en base)
    let orphanCount = 0;
    try {
      const diskFiles = await fs.readdir(uploadDir);

      if (diskFiles.length > 0) {
        const filesInDb = await this.filesRepository.find({
          select: ["storedName"],
        });
        const validNames = new Set(filesInDb.map((f) => f.storedName));

        for (const diskFile of diskFiles) {
          if (validNames.has(diskFile)) continue;
          try {
            await fs.unlink(path.join(uploadDir, diskFile));
            orphanCount += 1;
          } catch (error) {
            this.logger.warn(
              `Echec suppression orphelin ${diskFile}: ${String(error)}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        `Dossier uploads introuvable, balayage orphelins ignore: ${String(error)}`,
      );
    }

    this.logger.log(
      `Purge terminee — expires: ${expiredCount}, orphelins: ${orphanCount}`,
    );
  }
}
