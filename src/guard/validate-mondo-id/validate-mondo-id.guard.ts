/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ValidateMongoIdGuard implements CanActivate {
  constructor() { }


  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean>  {



    const request = context.switchToHttp().getRequest();
    const id = request.params.id; // Obtén el ID de la solicitud

    // Validar si el ID de MongoDB es válido
    const isValid = /^[0-9a-fA-F]{24}$/.test(id);

    if(!isValid) throw new BadRequestException('El ID de MongoDB no es válido');
    
    return isValid;
  }
}
