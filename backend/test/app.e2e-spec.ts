import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const authServiceMock = {
    register: jest.fn(({ email }: { email: string }) => ({
      id: 'new-user-id',
      email,
    })),
    login: jest.fn(() => ({
      access_token: 'fake-jwt-token',
    })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new-user@datashare.fr',
        password: 'MotDePasse123',
      })
      .expect(201)
      .expect(
        ({
          body,
        }: {
          body: {
            id: string;
            email: string;
          };
        }) => {
        expect(body).toEqual({
          id: 'new-user-id',
          email: 'new-user@datashare.fr',
        });
        },
      );
  });

  it('/auth/login (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'new-user@datashare.fr',
        password: 'MotDePasse123',
      })
      .expect(200)
      .expect(
        ({
          body,
        }: {
          body: {
            access_token: string;
          };
        }) => {
        expect(body).toEqual({
          access_token: 'fake-jwt-token',
        });
        },
      );
  });
});
