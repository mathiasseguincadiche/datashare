import * as path from 'path';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DownloadDto } from './dto/download.dto';
import { UploadOptionsDto } from './dto/upload.dto';
import { FilesService } from './files.service';

@ApiTags('Fichiers')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uploader un fichier' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        expiresInDays: { type: 'number', minimum: 1, maximum: 7 },
        password: { type: 'string', minLength: 6 },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Fichier uploade avec succes' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou donnees invalides' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
    @Body() options: UploadOptionsDto,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier recu');
    }

    return this.filesService.uploadFile(file, user.id, options);
  }

  @Get(':token/info')
  @ApiOperation({ summary: 'Recuperer les informations publiques dun fichier' })
  @ApiResponse({ status: 200, description: 'Informations du fichier recuperees' })
  @ApiResponse({ status: 404, description: 'Lien invalide ou inexistant' })
  @ApiResponse({ status: 410, description: 'Lien expire' })
  getFileInfo(@Param('token') token: string) {
    return this.filesService.getFileInfo(token);
  }

  @Post(':token/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Telecharger un fichier via son lien public' })
  @ApiResponse({ status: 200, description: 'Fichier telecharge' })
  @ApiResponse({ status: 401, description: 'Mot de passe requis ou incorrect' })
  @ApiResponse({ status: 404, description: 'Lien invalide ou inexistant' })
  @ApiResponse({ status: 410, description: 'Lien expire' })
  async downloadFile(
    @Param('token') token: string,
    @Body() dto: DownloadDto,
    @Res() res: Response,
  ) {
    const { filePath, originalName, mimeType } =
      await this.filesService.downloadFile(token, dto.password);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${originalName}"`,
    });

    return res.sendFile(path.resolve(filePath));
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consulter lhistorique de ses fichiers' })
  @ApiResponse({ status: 200, description: 'Historique recupere avec succes' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  getHistory(@CurrentUser() user: { id: string }) {
    return this.filesService.getHistory(user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un fichier de son historique' })
  @ApiResponse({ status: 200, description: 'Fichier supprime avec succes' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  @ApiResponse({ status: 404, description: 'Fichier non trouve' })
  deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.deleteFile(id, user.id);
  }
}
