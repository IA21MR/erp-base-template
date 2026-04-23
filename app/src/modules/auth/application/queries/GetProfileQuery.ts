// Query para obtener el perfil del usuario autenticado
export class GetProfileQuery {
  constructor(public readonly userId: number) {}
}
