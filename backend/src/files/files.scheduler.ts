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
   * Purge quotidienne : supprime les fichiers dont la date d'expiration est passee.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpiredFiles() {
    this.logger.log("Demarrage de la purge quotidienne des fichiers expires");

    const expiredFiles = await this.filesRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
      },
    });

    const uploadDir =
      this.configService.get<string>("UPLOAD_DIR") || "./uploads";
    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        await fs.unlink(path.join(uploadDir, file.storedName));
      } catch {
        this.logger.warn(`Fichier physique deja absent: ${file.storedName}`);
      }

      await this.filesRepository.remove(file);
      deletedCount += 1;
    }

    this.logger.log(`Purge terminee: ${deletedCount} fichier(s) supprime(s)`);
  }

  /**
   * Balayage horaire : supprime les fichiers sur disque qui n'ont plus de ligne en base.
   * Couvre les cas de suppression d'utilisateur en cascade (DB nettoyee, disque oublie)
   * et les rollbacks incomplets.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async purgeOrphanDiskFiles() {
    const uploadDir =
      this.configService.get<string>("UPLOAD_DIR") || "./uploads";

    let diskFiles: string[];
    try {
      diskFiles = await fs.readdir(uploadDir);
    } catch (error) {
      this.logger.warn(
        `Dossier uploads introuvable, balayage ignore: ${String(error)}`,
      );
      return;
    }

    if (diskFiles.length === 0) {
      return;
    }

    // On recupere tous les noms stockes en base en une seule requete.
    const filesInDb = await this.filesRepository.find({
      select: ["storedName"],
    });
    const validNames = new Set(filesInDb.map((f) => f.storedName));

    let orphanCount = 0;
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

    if (orphanCount > 0) {
      this.logger.log(
        `Balayage orphelins: ${orphanCount} fichier(s) disque supprime(s)`,
      );
    }
  }
}
