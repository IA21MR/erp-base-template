/**
 * DTO de respuesta para el caso de uso de Login
 */
import { AuthTokens } from '../../domain/entities/AuthTokens.entity';

export interface LoginResponseDTO {
  message: string;
  data: AuthTokens;
}
