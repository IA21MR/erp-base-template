import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './infrastructure/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar Express para formatear JSON en desarrollo (mejor legibilidad)
  // En producción se mantiene minificado para ahorrar ancho de banda
  //  IMPORTANTE: Asegurarse que NODE_ENV=production en el servidor de producción
  // En desarrollo:Utilizar  if (process.env.NODE_ENV !== 'development')
  if (process.env.NODE_ENV !== 'production') {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('json spaces', 2);
  }

  // Habilitar CORS para el frontend
  // CORS: Configuración dinámica desde variables de entorno
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3001']; // Fallback seguro

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  console.log('🌐 CORS habilitado para:', corsOrigins);

  // Servir archivos estáticos de la carpeta 'uploads/'
  // Esto permite acceder a /uploads/... desde el cliente
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/uploads', require('express').static(join(process.cwd(), 'uploads')));

  // Habilitar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos
    })
  );

  // Filtro global para excepciones de dominio
  app.useGlobalFilters(new DomainExceptionFilter());

  // Swagger solo en entornos no-productivos (evita overhead de reflection sobre
  // todos los controllers y DTOs durante el bootstrap en producción)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ERP API')
      .setDescription('API para sistema ERP con autenticación y RBAC')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingresa tu token JWT',
          in: 'header',
        },
        'JWT-auth'
      )
      .addTag('auth', 'Autenticación y sesión')
      .addTag('users', 'Gestión de usuarios')
      .addTag('roles', 'Gestión de roles y permisos')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log(
      `📚 Swagger docs: http://localhost:${process.env.PORT ?? 3000}/api`
    );
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`
  );
}
bootstrap();
