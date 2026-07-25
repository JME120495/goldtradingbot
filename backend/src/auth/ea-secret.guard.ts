import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class EaSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const eaSecret = request.headers['x-ea-secret'];
    const expectedSecret = process.env.EA_SECRET;

    if (!expectedSecret) {
      // If no secret is configured, deny all to be safe, or allow all if development?
      // Better to require it in production. We will enforce it.
      throw new UnauthorizedException('EA_SECRET is not configured on the server.');
    }

    if (eaSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid EA Secret');
    }

    return true;
  }
}
