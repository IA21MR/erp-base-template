// Result con lista de usuarios
import { User } from '../../domain/entities/User.entity';

export class UsersListResult {
  constructor(public readonly users: User[]) {}
}
