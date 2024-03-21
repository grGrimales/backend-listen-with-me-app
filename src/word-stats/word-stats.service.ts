/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWordStatDto } from './dto/create-word-stat.dto';
import { UpdateWordStatDto } from './dto/update-word-stat.dto';
import { handleError } from '../helpers/handled-error';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Word } from '../word/entities/word.entity';
import { WordStat } from './entities/word-stat.entity';
import { format } from 'path';
import { categorys } from '../category/category.service';

interface IQuerys {
  orden: string;
  category?: string,
  search?: string,
  favoritos?: string,
  total?: number
}



@Injectable()
export class WordStatsService {

  private validOrden = ['recientes', 'antiguas', 'mas-reproducidas', 'menos-reproducidas', 'aleatorias'];


  constructor(
    @InjectModel('Word') private wordModel: Model<Word>,
    @InjectModel('WordStat') private wordStat: Model<WordStat>,
    //    @InjectModel('User') private userModel: Model<User>,
  ) { }



  async incrementReproductions(id: string, userId: string, typeReproductions: string) {

    try {


      const validTypes = ['reproductions', 'reproductionsCompletes']; // reproductionsCompletes
      if (!validTypes.includes(typeReproductions)) {
        throw new BadRequestException(`Params type_reproductions is not valid:  (${validTypes.join(', ')})`);
      }


      // Validar que la palabra exista
      await this.validateExistWordStat(id);

      // Incrementar reproducciones
      const wordStats = await this.wordStat.findOne(
        {
          user: userId,
          word: id
        }
      ).exec();


      // si no existe crear el registro con reproducciones = 1
      if (!wordStats) {

        const newWordStat = new this.wordStat({
          user: userId,
          word: id,
          reproductions: (typeReproductions === 'reproductions') ? 1 : 0,
          reproductionsCompletes: (typeReproductions === 'reproductionsCompletes') ? 1 : 0,
          isFavorite: false,
          isOwner: true,
          listenDate: new Date(),
          playList: []
        });

        await newWordStat.save();

        return { 'success': true, newWordStat };

      }


      // si existe incrementar reproducciones
      (typeReproductions === 'reproductions') ? wordStats.reproductions += 1 : wordStats.reproductionsCompletes += 1;
      wordStats.isOwner = true;
      await wordStats.save();
      return { 'success': true, wordStats };
    } catch (error) {
      handleError(error);
    }

  }

  async findAll(
    userId: string, querys: IQuerys
  ) {
    try {

      const { orden, category, favoritos, total = 10 } = querys;

      this.validateOrden(orden);
      this.validateTotal(total);
      this.validateCategory(category);


      const pipeline: any[] = [
        {
          $match: {
            // Asegúrate de convertir el userId a ObjectId
            user: new mongoose.Types.ObjectId(userId),
          },
        },

        {
          $lookup: {
            from: 'words',
            localField: 'word',
            foreignField: '_id',
            as: 'word',
          },
        },
        {
          $unwind: '$word',
        }
      ]


      //Filtrar por categoria

      if (category !== 'Todas') {
        pipeline.push({
          $match: {
            'word.categories': category
          }
        });

      }

      // Si la orden es 'aleatorias', agregamos la etapa $sample al pipeline
      if (orden === 'aleatorias') {
        pipeline.push({
          $sample: { size: +total },
        });
      }

      // Ordenar por la más reciente
      if (orden === 'recientes') {
        pipeline.push({
          $sort: {
            listenDate: -1,
          },
        });
      }

      if (orden === 'antiguas') {
        pipeline.push({
          $sort: {
            listenDate: 1,
          },
        });
      }

      if (orden === 'mas-reproducidas') {
        pipeline.push({
          $sort: {
            reproductions: -1,
          },
        });
      }

      if (orden === 'menos-reproducidas') {
        pipeline.push({
          $sort: {
            reproductions: 1,
          },
        });
      }

      if (orden === 'mas-reproducidas-completas') {
        pipeline.push({
          $sort: {
            reproductionsCompletes: -1,
          },
        });
      }

      if (orden === 'menos-reproducidas-completas') {
        pipeline.push({
          $sort: {
            reproductionsCompletes: 1,
          },
        });
      }
      // Limitar el número de resultados
      pipeline.push({
        $limit: +total,
      });
      const words = await this.wordStat.aggregate(pipeline);
      const countWords = await this.wordStat.aggregate(pipeline).count('words');

      return {
        ok: true,
        message: 'findAll',
        countWords,
        words,
      }




    } catch (error) {
      handleError(error);
    }
  }

  async addOwner(id: string, userId: string) {


      try {
        
        // Validar que la palabra exista
        this.validateExistWordStat(id);

        // Agregar owner a la palabra
        const wordStats = await this.wordStat.findOne(
          {
            user: userId,
            word: id
          }
        ).exec();

        // si la palabra no existe crearla y owner = true
        if (!wordStats) {

          const newWordStat = new this.wordStat({
            user: userId,
            word: id,
            reproductions: 0,
            reproductionsCompletes: 0,
            isFavorite: false,
            isOwner: true,
            listenDate: new Date(),
            playList: []
          });

          await newWordStat.save();

          return { 'success': true, newWordStat };

        }

        // si la palabra existe owner = true
        wordStats.isOwner = true;
        wordStats.save();
        return {
          ok: true,
          wordStats
        };


      } catch (error) {
        handleError(error);
      }
  }


  create(createWordStatDto: CreateWordStatDto) {
    return 'This action adds a new wordStat';
  }



  // ############### !Validaciones ##############################3

  async validateExistWordStat(id: string) {

    // Validar que la palabra exista
    const word = await this.wordModel.findById(id);

    if (!word) {
      throw new BadRequestException('Word with id ' + id + ' not found');
    }

  }








  findOne(id: number) {
    return `This action returns a #${id} wordStat`;
  }

  update(id: number, updateWordStatDto: UpdateWordStatDto) {
    return `This action updates a #${id} wordStat`;
  }

  remove(id: number) {
    return `This action removes a #${id} wordStat`;
  }


  async addWordToCategory(id: string, categorys: string[], userId: string) {

    try {

      if (!categorys) {
        throw new BadRequestException('categorys is required 1');
      }


      if (categorys.length === 0) {
        throw new BadRequestException('categorys is required 2');
      }

      //Validar que categorys sea un array
      if (!Array.isArray(categorys)) {
        throw new BadRequestException('categorys must be an array');
      }

      categorys.map(this.validateCategory)


      // Validar que la palabra exista
      await this.validateExistWordStat(id);

      // Agregar categorias a la palabra por usuario
      const wordStats = await this.wordStat.findOne(
        {
          user: userId,
          word: id
        }
      ).exec();

      // si la palabra no existe crearla, agregar categorias y owner = true
      if (!wordStats) {

        const newWordStat = new this.wordStat({
          user: userId,
          word: id,
          reproductions: 0,
          reproductionsCompletes: 0,
          isFavorite: false,
          isOwner: true,
          listenDate: new Date(),
          playList: [],
          categories: categorys
        });

        await newWordStat.save();

        return { 'success': true, newWordStat };

      }


      // si la palabra existe agregar las categorias nuevas al array existente, las antiguas dejarlas igual y owner = true
      wordStats.categories = [...new Set([...wordStats.categories, ...categorys])] as [string]; 
      wordStats.isOwner = true;
      await wordStats.save();

      return {
        ok: true,
        wordStats
      };

    } catch (error) {

      handleError(error);

    }
  }



  // TODO: Estos metodos se repiten, se deberian llevar a un servicio aparte

  validateOrden(orden: string) {

    if (!orden) {
      throw new BadRequestException('orden is required');
    }

    if (!this.validOrden.includes(orden)) {
      throw new BadRequestException(`Orden not valid(${this.validOrden.join(', ')})`);
    }
  }

  validateTotal(total: number) {
    if (!total) {
      throw new BadRequestException('total is required');
    }

    if (isNaN(total)) {
      throw new BadRequestException('total must be a number');
    }



    if (total < 1) {
      throw new BadRequestException('total must be greater than 0');
    }

  }


  validateCategory(category: string) {

    if (!category) {
      throw new BadRequestException('category is required');
    }


    const currentValidCategorys = categorys.map(category => category.name);
    if (!currentValidCategorys.includes(category)) {
      throw new BadRequestException(`category ${category} not valid (${currentValidCategorys.join(', ')})`);
    }
  }

}
