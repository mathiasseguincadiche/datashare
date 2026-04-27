import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  // ─── Helper : ConfigService mocké, retourne la valeur passée ───
  const makeConfigService = (secret: string | undefined): ConfigService =>
    ({ get: jest.fn().mockReturnValue(secret) }) as unknown as ConfigService;

  describe("constructor", () => {
    it("lit JWT_SECRET via ConfigService et instancie la stratégie", () => {
      const configService = makeConfigService("ma-cle-secrete-de-test");
      const strategy = new JwtStrategy(configService);

      expect(configService.get).toHaveBeenCalledWith("JWT_SECRET");
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it("lève une erreur si JWT_SECRET est absent (refus de démarrer)", () => {
      const configService = makeConfigService(undefined);

      expect(() => new JwtStrategy(configService)).toThrow(
        /JWT_SECRET manquant/,
      );
    });
  });

  describe("validate", () => {
    it("transforme le payload { sub, email } en { id, email }", async () => {
      const configService = makeConfigService("secret");
      const strategy = new JwtStrategy(configService);

      const payload = { sub: "user-uuid-123", email: "test@datashare.fr" };
      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: "user-uuid-123",
        email: "test@datashare.fr",
      });
    });
  });
});
