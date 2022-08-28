import { SetMetadata } from '@nestjs/common';
import { Roles } from '../entities/role.entity';

export const ROLE_KEY = 'role';
export const Role = (...role: Roles[]) => SetMetadata(ROLE_KEY, role);
