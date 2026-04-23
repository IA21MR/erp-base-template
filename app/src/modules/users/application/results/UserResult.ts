// Result con información del usuario creado/actualizado
import { User } from '../../domain/entities/User.entity';

export class UserResult {
  constructor(public readonly user: User) {}
}
