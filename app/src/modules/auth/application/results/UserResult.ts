// Result con información del usuario autenticado
// Usa datos planos para evitar acoplamiento con la entidad User de otro bounded context

export interface AuthenticatedUserData {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

export class UserResult {
  constructor(public readonly user: AuthenticatedUserData) {}
}
