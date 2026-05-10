import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user/entities/user.entity';

export const ROLE_KEY = 'role';
export const Role = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);
