// Caso de uso: Obtener perfil del usuario autenticado
import { UserRepository } from '../../../users/domain/repositories/UserRepository.interface';
import { GetProfileQuery } from '../queries/GetProfileQuery';
import { UserResult } from '../results/UserResult';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';

export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetProfileQuery): Promise<UserResult> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return new UserResult({
      id: user.id,
      name: user.name,
      email: user.email.value,
      active: user.active,
    });
  }
}
