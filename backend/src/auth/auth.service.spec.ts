import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { User } from "../users/user.entity";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-jwt-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    const dto = { email: "Test@Example.com", password: "password123" };

    it("devrait creer un utilisateur et retourner id + email", async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      mockUsersRepository.create.mockReturnValue({
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      mockUsersRepository.save.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
      });

      const result = await service.register(dto);

      expect(result).toEqual({ id: "uuid-1", email: "test@example.com" });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it("devrait lever ConflictException si email deja utilise", async () => {
      mockUsersRepository.findOne.mockResolvedValue({ id: "existing" });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    const dto = { email: "Test@Example.com", password: "password123" };

    it("devrait retourner un access_token si identifiants valides", async () => {
      mockUsersRepository.findOne.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result).toEqual({ access_token: "mock-jwt-token" });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: "uuid-1",
        email: "test@example.com",
      });
    });

    it("devrait lever UnauthorizedException si utilisateur introuvable", async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it("devrait lever UnauthorizedException si mot de passe incorrect", async () => {
      mockUsersRepository.findOne.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        passwordHash: "hashed-password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
