import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../../user/entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class JwtValidateGuard implements CanActivate {

  constructor(@InjectModel('User') private userModel: Model<User>) { }

  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean>  {


    const token = context.switchToHttp().getRequest().headers.token;
    if (!token) {
      throw new UnauthorizedException('No existe token en el header');
    }


    try {

      const decoded = jwt.verify(token, process.env.MY_SECRECT_KEY);
      const user = await this.userModel.findById(decoded.userId);
   
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
     // Agregar el ID del usuario a la solicitud (request)
     context.switchToHttp().getRequest().user = user; // Esto agrega el usuario al request

     return true;

    } catch (error) {
      console.log("ha ocurrido un error...")
      throw new UnauthorizedException('Token invalido');

    }


   




  }




}
