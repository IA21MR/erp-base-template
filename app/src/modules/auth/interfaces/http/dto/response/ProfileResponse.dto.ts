// DTO de Response para el perfil del usuario autenticado
import { UserResponseDto } from '../../../../../users/interfaces/http/dto/response/UserResponse.dto';

export class ProfileResponseDto {
  message: string;
  data: UserResponseDto;
}
