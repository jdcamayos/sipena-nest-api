import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBIC_KEY } from '../decorators/public.decorator';
import { ROLE_KEY } from '../decorators/role.decorator';
import { Roles } from '../entities/role.entity';
import { RequestType } from '../entities/request.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get Public Decorator value
    const isPublic = this.reflector.get(IS_PUBIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }
    // Get required Role values
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    // Get User info
    const { user } = context.switchToHttp().getRequest<RequestType>();
    // Verify role
    if (requiredRoles.some((role) => user.role === role)) {
      return true;
    }
    throw new ForbiddenException(
      `Your ${user.role} role hasn't allowed this resource`,
    );
  }
}
