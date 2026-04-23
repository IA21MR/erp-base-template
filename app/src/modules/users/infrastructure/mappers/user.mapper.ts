// Mapper para transformar entre capas de User
import { User } from '../../domain/entities/User.entity';
import { UserResponseDto } from '../../interfaces/http/dto/response/UserResponse.dto';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      active: user.active,
    };
  }

  static toResponseDtoArray(users: User[]): UserResponseDto[] {
    return users.map((u) => this.toResponseDto(u));
  }
}
