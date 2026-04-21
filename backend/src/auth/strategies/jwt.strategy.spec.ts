import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    // On mocke ConfigService : le constructeur appelle
    // configService.get('JWT_SECRET') et jette une erreur si absent.
    // → on renvoie un secret factice pour permettre à super({...}) de s'initialiser.
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret-factice-pour-les-tests'),
    };

    strategy = new JwtStrategy(mockConfigService as ConfigService);
  });

  describe('constructor', () => {
    it('devrait lire JWT_SECRET depuis ConfigService', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('devrait jeter une erreur si JWT_SECRET est absent', () => {
      const configServiceVide = {
        get: jest.fn().mockReturnValue(undefined),
      };

      expect(
        () => new JwtStrategy(configServiceVide as unknown as ConfigService),
      ).toThrow('JWT_SECRET manquant');
    });
  });

  describe('validate', () => {
    it('devrait extraire id et email depuis le payload JWT', async () => {
      const payload = { sub: '42', email: 'test@datashare.fr' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: '42',
        email: 'test@datashare.fr',
      });
    });

    it('devrait fonctionner avec un autre utilisateur', async () => {
      const payload = { sub: 'abc-123', email: 'autre@datashare.fr' };

      const result = await strategy.validate(payload);

      expect(result.id).toBe('abc-123');
      expect(result.email).toBe('autre@datashare.fr');
    });
  });
});
