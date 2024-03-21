import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
require('dotenv').config();

interface UserResponse {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  token: string
}


@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) { }


  async register(createUserDto: CreateUserDto): Promise<{
    userId: string;
    email: string;
    fullName: string;
    roles: string[];
    token: string
  }> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    try {
      const savedUser = await createdUser.save();
      const token = jwt.sign(
        { userId: savedUser.id, email: savedUser.email }, process.env.MY_SECRECT_KEY,
        { expiresIn: process.env.TOKEN_DURATION || '48h' });
      return {
        userId: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        roles: savedUser.roles,
        token
      };
    } catch (error) {

      console.log(error);
      this.handleError(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{
    userId: string;
    email: string;
    fullName: string;
    roles: string[];
    token: string
  }> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.MY_SECRECT_KEY, { expiresIn: process.env.TOKEN_DURATION || '48h' });
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      token
    };
  
  }



  async validateToken(request: Request): Promise<any> {
    try {
      const user = request['user'] as User;
      const newToken = jwt.sign({ userId: user.id, email: user.email }, process.env.MY_SECRECT_KEY, { expiresIn: process.env.TOKEN_DURATION || '48h' });
      return {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        token: newToken
      };

    } catch (error) {
      console.log(error);
      return this.handleError(error);
    }
  }




  async findAll() {
    try {

      const users = await this.userModel.find();
      return {
        users
      }

    } catch (error) {
      console.log(error);
      this.handleError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }


  private handleError(error: any): any {

    if (error.code === 11000) {
      throw new BadRequestException('Email already exists');
    } else if (error.name === 'JsonWebTokenError') {

      throw new UnauthorizedException('No estás autorizado para realizar esta acción');

    }

    else if (error.name === 'ValidationError') {
      throw new BadRequestException('Invalid data');
    } else if (error instanceof UnauthorizedException) {
      // Aquí manejas el error de no autorización
      throw new UnauthorizedException('No estás autorizado para realizar esta acción');
    } else {
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
