import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

describe("FilesController", () => {
  let controller: FilesController;
  let filesService: FilesService;

  const mockFilesService = {
    uploadFile: jest.fn(),
    getFileInfo: jest.fn(),
    downloadFile: jest.fn(),
    getHistory: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockUser = { id: "user-uuid-123" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: mockFilesService }],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe("uploadFile", () => {
    it("should delegate to filesService.uploadFile", () => {
      const file = {
        originalname: "rapport.pdf",
        filename: "uuid-rapport.pdf",
        path: "/tmp/uuid-rapport.pdf",
        size: 2048,
        mimetype: "application/pdf",
      } as Express.Multer.File;
      const options = { expiresInDays: 7 };
      const expected = { id: 1, token: "abc-def", originalName: "rapport.pdf" };
      mockFilesService.uploadFile.mockReturnValue(expected);

      const result = controller.uploadFile(
        file,
        mockUser as any,
        options as any,
      );

      expect(filesService.uploadFile).toHaveBeenCalledWith(
        file,
        mockUser.id,
        options,
      );
      expect(result).toEqual(expected);
    });

    it("should throw BadRequestException if no file provided", () => {
      expect(() => {
        controller.uploadFile(undefined as any, mockUser as any, {} as any);
      }).toThrow(BadRequestException);
    });
  });

  describe("getFileInfo", () => {
    it("should delegate to filesService.getFileInfo with token", () => {
      const fileInfo = { originalName: "rapport.pdf", size: 2048 };
      mockFilesService.getFileInfo.mockReturnValue(fileInfo);

      const result = controller.getFileInfo("abc-def");

      expect(filesService.getFileInfo).toHaveBeenCalledWith("abc-def");
      expect(result).toEqual(fileInfo);
    });
  });

  describe("downloadFile", () => {
    it("should call filesService.downloadFile and stream the file", async () => {
      const fileData = {
        filePath: "/uploads/uuid.pdf",
        originalName: "rapport.pdf",
        mimeType: "application/pdf",
      };
      mockFilesService.downloadFile.mockResolvedValue(fileData);
      const mockRes = {
        set: jest.fn(),
        sendFile: jest.fn(),
      };
      const dto = { password: "secret123" };

      await controller.downloadFile("abc-def", dto as any, mockRes as any);

      expect(filesService.downloadFile).toHaveBeenCalledWith(
        "abc-def",
        "secret123",
      );
      expect(mockRes.set).toHaveBeenCalled();
      expect(mockRes.sendFile).toHaveBeenCalled();
    });
  });

  describe("getHistory", () => {
    it("should delegate to filesService.getHistory with user id", () => {
      const history = [{ id: 1, originalName: "rapport.pdf" }];
      mockFilesService.getHistory.mockReturnValue(history);

      const result = controller.getHistory(mockUser as any);

      expect(filesService.getHistory).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(history);
    });
  });

  describe("deleteFile", () => {
    it("should delegate to filesService.deleteFile with id and user id", () => {
      mockFilesService.deleteFile.mockReturnValue(undefined);

      controller.deleteFile("file-uuid-456", mockUser as any);

      expect(filesService.deleteFile).toHaveBeenCalledWith(
        "file-uuid-456",
        mockUser.id,
      );
    });
  });
});
