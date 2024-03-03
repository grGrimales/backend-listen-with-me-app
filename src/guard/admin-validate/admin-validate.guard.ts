import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminValidateGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {


    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      // Lanza una excepción UnauthorizedException con un mensaje personalizado
      throw new UnauthorizedException('No estás autenticado. Inicia sesión para acceder.');
    }

    const isAdminRole = user.roles.includes('ADMIN_ROLE');

    if (!isAdminRole) {
      // Lanza una excepción UnauthorizedException con un mensaje personalizado
      throw new UnauthorizedException('No tienes permisos de administrador.');
    }

    return true;
  }
    


}
