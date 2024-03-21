/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface Level{
  id: number;
  level: string;
}

export const categorys = [
  {
    id: 11,
    name: 'Todas',
  },
  {
    id: 1,
    name: 'Ciencia y tecnologia',
  },
  {
    id: 2,
    name: 'Arte y turismo',
  },
  {
    id: 3,
    name: 'Cocina',
  },
  {
    id: 4,
    name: 'Deportes',
  },
  {
    id: 5,
    name: 'Salud y bienestar',
  },
  {
    id: 6,
    name: 'Cine y TV',
  },
  {
    id: 7,
    name: 'Historia',
  },
  {
    id: 8,
    name: 'Música',
  },
  {
    id: 9,
    name: 'Literatura',
  },
  {
    id: 10,
    name: 'Biografias',
  },

  {
    id: 12,
    name: 'Cuentos',
  },
];

@Injectable()
export class CategoryService {
  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  findAllCategorys() {

    return categorys;
  }


  findAllLevels(): any[] {
    const levels = [
      {
        id: 1,
        level: 'A1',
      },
      {
        id: 2,
        level: 'A2',
      },
      {
        id: 3,
        level: 'B1',
      },
      {
        id: 4,
        level: 'B2',
      },
      {
        id: 5,
        level: 'C1',
      },
      {
        id: 6,
        level: 'C2',
      },
    ];

    return levels;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
