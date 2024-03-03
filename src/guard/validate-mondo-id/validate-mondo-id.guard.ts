import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import{ Story } from '../../story/entities/story.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ValidateMongoIdGuard implements CanActivate {
  constructor(@InjectModel('Story') private storyModel: Model<Story>) { }


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
