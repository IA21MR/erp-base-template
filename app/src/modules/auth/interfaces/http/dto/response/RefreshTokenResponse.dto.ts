// DTO de Response para refresh token
// Formato de salida HTTP

import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Mensaje de respuesta',
    example: 'Token refrescado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Nuevos tokens de acceso y refresco',
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
    this.message = 'Token refrescado exitosamente';
    this.data = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    };
  }
}
