/**
 * Barrel export de excepciones de dominio - Módulo Users
 */
export { UserNotFoundException } from './UserNotFoundException';
export { DuplicateEmailException } from './DuplicateEmailException';
export { RoleNotFoundException } from './RoleNotFoundException';
export { DuplicateRoleException } from './DuplicateRoleException';
export { PermissionNotFoundException } from './PermissionNotFoundException';
export { InvalidRoleDataException } from './InvalidRoleDataException';
export { InvalidUserDataException } from './InvalidUserDataException';
export { IncoherentPermissionsException } from './IncoherentPermissionsException';
export { RoleHasUsersException } from './RoleHasUsersException';
export { SelfDeactivationException } from './SelfDeactivationException';
export { AdminDeactivationForbiddenException } from './AdminDeactivationForbiddenException';
export { UserAlreadyActiveException } from './UserAlreadyActiveException';
export { UserAlreadyInactiveException } from './UserAlreadyInactiveException';
