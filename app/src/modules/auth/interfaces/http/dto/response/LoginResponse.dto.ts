// DTO de Response para login
// Formato de salida HTTP

import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Mensaje de respuesta',
    example: 'Login exitoso',
  })
  message: string;

  @ApiProperty({
    description: 'Datos de autenticación',
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expires_in: '15m',
    },
  })
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
  };

  constructor(accessToken: string, refreshToken: string, expiresIn: string) {
    this.message = 'Login exitoso';
    this.data = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    };
  }
}
