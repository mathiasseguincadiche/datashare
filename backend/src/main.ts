import * as fs from "fs";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    exposedHeaders: ["Content-Disposition"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger n'est monte qu'en dehors de la production.
  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("DataShare API")
      .setDescription("API de transfert securise de fichiers")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Backend disponible sur http://localhost:${port}`);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`Swagger disponible sur http://localhost:${port}/api/docs`);
  }
}

void bootstrap();
