/* eslint-disable prettier/prettier */

import { BadRequestException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";




export const handleError = (error: any) => {

  console.log('error', error);

  if (error.message === 'File not found in cloudinary') {
    throw new BadRequestException('File not found in cloudinary');
  }



  // No se encontro el archivo en cloudinary
  if (error.http_code === 404) {

    throw new BadRequestException('File not found in cloudinary');

  }

  if (error.code === 11000) {
    // Convierte las claves y valores del objeto error.keyValue a una cadena legible.
    const keyValueString = Object.entries(error.keyValue)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ');

    throw new BadRequestException(`${keyValueString} already exists`);
  } else if (error.name === 'JsonWebTokenError' || error == "No tiene permisos para realizar esta acción") {

    throw new UnauthorizedException('No estás autorizado para realizar esta acción');
  } else if (error instanceof BadRequestException) {
    throw error; // Re-lanzar la misma excepción para que NestJS la maneje
  }



  // JsonWebTokenError: jwt malformed


  else if (error.name === 'ValidationError') {
    throw new BadRequestException('Invalid data');
  } else if (error instanceof UnauthorizedException) {
    // Aquí manejas el error de no autorización
    throw new UnauthorizedException('No estás autorizado para realizar esta acción');
  } else {
    throw new InternalServerErrorException('Something went wrong');
  }



}