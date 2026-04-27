import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  BadRequestException,
  GoneException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FilesService } from "./files.service";
import { File } from "../entities/file.entity";

// ─────────────────────────────────────────────────────────────
// Mock du module `file-type` (ESM pur, non résoluble par Jest CJS).
// On simule la détection MIME côté test → isole FilesService
// de la lib externe et évite de lire un vrai fichier sur le disque.
// { virtual: true } : Jest n'essaie pas de résoudre le module physiquement.
// ─────────────────────────────────────────────────────────────
jest.mock(
  "file-type",
  () => ({
    fileTypeFromFile: jest
      .fn()
      .mockResolvedValue({ mime: "application/pdf", ext: "pdf" }),
  }),
  { virtual: true },
);

jest.mock("bcrypt");
jest.mock("uuid", () => ({ v4: () => "mock-uuid-token" }));
jest.mock("fs/promises", () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe("FilesService", () => {
  let service: FilesService;

  const mockFilesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("./uploads"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(File), useValue: mockFilesRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue("./uploads");
  });

  describe("uploadFile", () => {
    const mockFile = {
      originalname: "doc.pdf",
      filename: "stored-123.pdf",
      size: 1024,
      mimetype: "application/pdf",
    } as Express.Multer.File;

    it("devrait uploader un fichier et retourner les infos", async () => {
      mockFilesRepository.create.mockReturnValue({});
      mockFilesRepository.save.mockResolvedValue({});
      mockConfigService.get.mockReturnValue("http://localhost:5173");

      const result = await service.uploadFile(mockFile, "user-1", {});

      expect(result.token).toBe("mock-uuid-token");
      expect(result.originalName).toBe("doc.pdf");
      expect(result.size).toBe(1024);
      expect(result.downloadUrl).toContain("mock-uuid-token");
      expect(mockFilesRepository.save).toHaveBeenCalled();
    });

    it("devrait lever BadRequestException si aucun fichier", async () => {
      await expect(
        service.uploadFile(null as any, "user-1", {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getFileInfo", () => {
    it("devrait retourner les infos du fichier", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockFilesRepository.findOne.mockResolvedValue({
        originalName: "doc.pdf",
        size: 1024,
        mimeType: "application/pdf",
        expiresAt: futureDate,
        passwordHash: null,
      });

      const result = await service.getFileInfo("valid-token");

      expect(result.originalName).toBe("doc.pdf");
      expect(result.isPasswordProtected).toBe(false);
    });

    it("devrait lever NotFoundException si token invalide", async () => {
      mockFilesRepository.findOne.mockResolvedValue(null);

      await expect(service.getFileInfo("bad-token")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("devrait lever GoneException si lien expire", async () => {
      const pastDate = new Date("2020-01-01");
      mockFilesRepository.findOne.mockResolvedValue({
        expiresAt: pastDate,
      });

      await expect(service.getFileInfo("expired-token")).rejects.toThrow(
        GoneException,
      );
    });
  });

  describe("downloadFile", () => {
    it("devrait retourner le chemin du fichier sans mot de passe", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockFilesRepository.findOne.mockResolvedValue({
        storedName: "stored-123.pdf",
        originalName: "doc.pdf",
        mimeType: "application/pdf",
        expiresAt: futureDate,
        passwordHash: null,
      });

      const result = await service.downloadFile("valid-token");

      expect(result.originalName).toBe("doc.pdf");
      expect(result.filePath).toContain("stored-123.pdf");
    });

    it("devrait lever UnauthorizedException si mot de passe requis mais absent", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockFilesRepository.findOne.mockResolvedValue({
        expiresAt: futureDate,
        passwordHash: "some-hash",
      });

      await expect(service.downloadFile("token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("getHistory", () => {
    it("devrait retourner la liste des fichiers de l utilisateur", async () => {
      mockFilesRepository.find.mockResolvedValue([
        { id: "1", originalName: "doc.pdf" },
      ]);

      const result = await service.getHistory("user-1");

      expect(result).toHaveLength(1);
      expect(mockFilesRepository.find).toHaveBeenCalled();
    });
  });

  describe("deleteFile", () => {
    it("devrait supprimer le fichier et retourner un message", async () => {
      mockFilesRepository.findOne.mockResolvedValue({
        id: "file-1",
        storedName: "stored-123.pdf",
      });
      mockFilesRepository.remove.mockResolvedValue({});

      const result = await service.deleteFile("file-1", "user-1");

      expect(result.message).toBe("Fichier supprime avec succes");
      expect(mockFilesRepository.remove).toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si fichier introuvable", async () => {
      mockFilesRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteFile("bad-id", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
