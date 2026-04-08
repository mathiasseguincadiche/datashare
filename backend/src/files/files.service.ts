import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { File } from '../entities/file.entity';
import {
  DEFAULT_EXPIRY_DAYS,
  MAX_EXPIRY_DAYS,
} from '../common/constants/file.constants';
import { UploadOptionsDto } from './dto/upload.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    options: UploadOptionsDto,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier recu');
    }

    const requestedDays = options.expiresInDays ?? DEFAULT_EXPIRY_DAYS;
    const expiresInDays = Math.min(
      Math.max(requestedDays, 1),
      MAX_EXPIRY_DAYS,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    let passwordHash: string | null = null;
    if (options.password) {
      passwordHash = await bcrypt.hash(options.password, 10);
    }

    const token = uuidv4();

    const fileRecord = this.filesRepository.create({
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      token,
      passwordHash,
      expiresAt,
      userId,
    });

    await this.filesRepository.save(fileRecord);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    return {
      downloadUrl: `${frontendUrl}/download/${token}`,
      expiresAt,
      token,
      originalName: file.originalname,
      size: file.size,
    };
  }

  async getFileInfo(token: string) {
    const file = await this.filesRepository.findOne({ where: { token } });

    if (!file) {
      throw new NotFoundException('Lien invalide ou inexistant');
    }

    if (new Date() > file.expiresAt) {
      throw new GoneException('Ce lien a expire');
    }

    return {
      originalName: file.originalName,
      size: Number(file.size),
      mimeType: file.mimeType,
      expiresAt: file.expiresAt,
      isPasswordProtected: Boolean(file.passwordHash),
    };
  }

  async downloadFile(token: string, password?: string) {
    const file = await this.filesRepository.findOne({ where: { token } });

    if (!file) {
      throw new NotFoundException('Lien invalide ou inexistant');
    }

    if (new Date() > file.expiresAt) {
      throw new GoneException('Ce lien a expire');
    }

    if (file.passwordHash) {
      if (!password) {
        throw new UnauthorizedException('Mot de passe requis');
      }

      const isValidPassword = await bcrypt.compare(password, file.passwordHash);
      if (!isValidPassword) {
        throw new UnauthorizedException('Mot de passe incorrect');
      }
    }

    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';

    return {
      filePath: path.join(uploadDir, file.storedName),
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  }

  async getHistory(userId: string) {
    return this.filesRepository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
      select: ['id', 'originalName', 'size', 'createdAt', 'expiresAt', 'token'],
    });
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.filesRepository.findOne({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new NotFoundException('Fichier non trouve');
    }

    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';

    try {
      await fs.unlink(path.join(uploadDir, file.storedName));
    } catch {
      // On garde une suppression robuste meme si le fichier a deja disparu du disque.
    }

    await this.filesRepository.remove(file);

    return {
      message: 'Fichier supprime avec succes',
    };
  }
}
