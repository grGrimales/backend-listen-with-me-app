import { v4 as uuidv4 } from 'uuid';

import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { storyDummy } from './data-dummy';
import { InjectModel } from '@nestjs/mongoose';
import { Story } from './entities/story.entity';
import mongoose, { Model } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { handleError } from '../helpers/handled-error';
import { Stat } from '../stats/entities/stat.entity';
import { v2 as cloudinary } from 'cloudinary';
import { FileService } from '../file/file.service';
import { CategoryService, categorys } from '../category/category.service';

interface IQuerys {
  orden: string;
  category: string,
  search: string,
  favoritos: string,
  total: number
}


@Injectable()
export class StoryService {



  private validOrden = ['recientes', 'antiguas', 'mas-reproducidas', 'menos-reproducidas', 'aleatorias'];

  constructor(
    @InjectModel('Story') private readonly storyModel: Model<Story>,
    @InjectModel('Stats') private statsModel: Model<Stat>,

    private readonly fileService: FileService,
    private readonly categoryService: CategoryService,


  ) { }



  async create(
    createStoryDto: CreateStoryDto,
    userId: string
  ) {
    try {

      createStoryDto.categories.map(this.validateCategory)

      const levels = await this.categoryService.findAllLevels();

      if (!levels.find(level => level.level === createStoryDto.level)) {
        throw new BadRequestException(`Level no válido (${levels.map(level => level.level).join(', ')})`);
      }

      // asignar id al parrafo
      createStoryDto.paragraph = createStoryDto.paragraph.map((element, index) => {
        return {
          ...element,
          id_paragraph: uuidv4()
        }
      }
      );

      // Verificar si ya existe una historia con el mismo título  
      const existStoryByTitle = await this.storyModel.findOne({ title: createStoryDto.title });

      if (existStoryByTitle) {
        throw new BadRequestException("Ya existe una historia con ese titulo");
      }


      // Mapea cada elemento del array a una promesa de subida de archivo

      const uploadImgPromises = createStoryDto.paragraph.map(async (element, index) => {


        if (element.img) {
          return this.fileService.uploadPermanentFile(element.img, createStoryDto.title);
        }

      });


      const uploadAudioPromises = createStoryDto.paragraph.map(async (element, index) => {

        if (element.audio) {
          return this.fileService.uploadPermanentFile(element.audio, createStoryDto.title);
        }
      });


      const [resultsImg, resultsAudio] = await Promise.all([Promise.all(uploadImgPromises), Promise.all(uploadAudioPromises)]);

      resultsImg.forEach((result, index) => {
        if (result instanceof BadRequestException) {
          throw new BadRequestException("Error al subir la imagen"); // !TODO: regresar una imagen por defecto
        }

        if (createStoryDto.paragraph[index].img) {
          createStoryDto.paragraph[index].img = result.secure_url;
        }
      }
      );

      resultsAudio.forEach((result, index) => {
        if (result instanceof BadRequestException) {
          throw new BadRequestException("Error al subir el audio"); // !TODO: regresar una imagen por defecto
        }

        if (createStoryDto.paragraph[index].audio) {
          createStoryDto.paragraph[index].audio = result.secure_url;
        }
      }
      );

      const createdStory = new this.storyModel({
        ...createStoryDto,
        user: userId

      });
      const userSeved = await createdStory.save();



      return {
        message: "Historia creada correctamente",
        data: userSeved
      };

    } catch (error) {

      handleError(error);

    }

  }

  async findAllByFiltros(userId: string, querys: IQuerys) {

    try {


      this.validateOrden(querys.orden);


      const storys = await this.storyModel.find()
        .exec();



      const storiesWithStats = await Promise.all(storys.map(async (story) => {
        const stats = await this.statsModel.findOne({ story: story._id, user: userId })
          .exec();

        if (!stats) {

          return {
            ...story.toObject(),
            reproductions: 0,
            reproductionsCompletes: 0,
            isFavorite: false,
            listenDate: null,
          }


        } else {

          return {
            ...story.toObject(),
            reproductions: stats.reproductions,
            reproductionsCompletes: stats.reproductionsCompletes,
            isFavorite: stats.isFavorite,
            listenDate: stats.listenDate,
          }

        }

      }
      ));



      if (querys.orden === 'aleatorias') {

        console.log('aleatorias');

        storiesWithStats.sort(() => Math.random() - 0.5);

      } else if (querys.orden === 'mas-reproducidas') {

        storiesWithStats.sort((a, b) => b.reproductions - a.reproductions);

      } else if (querys.orden === 'menos-reproducidas') {

        storiesWithStats.sort((a, b) => a.reproductions - b.reproductions);
      } else if (querys.orden === 'mas-reproducidas-completas') {

        storiesWithStats.sort((a, b) => b.reproductionsCompletes - a.reproductionsCompletes);
      } else if (querys.orden === 'menos-reproducidas-completas') {

        storiesWithStats.sort((a, b) => a.reproductionsCompletes - b.reproductionsCompletes);
      } else if (querys.orden === 'recientes') {

        storiesWithStats.sort((a, b) => new Date(b.listenDate).getTime() - new Date(a.listenDate).getTime());
      } else if (querys.orden === 'antiguas') {
        storiesWithStats.sort((a, b) => new Date(a.listenDate).getTime() - new Date(b.listenDate).getTime());
      }


      if (querys.search) {

        storiesWithStats.filter(story => story.title.toLowerCase().includes(querys.search.toLowerCase()))
      }

      if (querys.category !== 'todas') {

        return {
          storys: storiesWithStats.filter(story => story.categories.includes(querys.category))
        };
      }

      // if (querys.favoritos === 'true') {

      //   return {
      //     storys: storiesWithStats.filter(story => story.isFavorite === true)
      //   };

      // }

      return {
        storys: storiesWithStats
      };
    } catch (error) {
      handleError(error);
    }

  }



  async findAll(userId: string) {

    try {


      const storys = await this.storyModel.find()
        .exec();

      const storiesWithStats = await Promise.all(storys.map(async (story) => {
        const stats = await this.statsModel.findOne({ story: story._id, user: userId })
          .exec();

        if (!stats) {

          return {
            ...story.toObject(),
            reproductions: 0,
            reproductionsCompletes: 0,
            isFavorite: false,
          }


        } else {

          return {
            ...story.toObject(),
            reproductions: stats.reproductions,
            reproductionsCompletes: stats.reproductionsCompletes,
            isFavorite: stats.isFavorite,
          }

        }

      }
      ));



      return {
        storys: storiesWithStats
      };
    } catch (error) {
      handleError(error);
    }

  }

  async uploapFileCloudinary(file: any, type: string) {

    try {

      cloudinary.config({
        cloud_name: 'dvmpfgqrs',
        api_key: '317435678887483',
        api_secret: 'ZwSVyZ-z-J_F6osYUx3MbfvZD-g'
      })


      const result = await cloudinary.uploader.upload(file.path, {

        resource_type: 'auto'

      });

      return {
        message: 'Archivo subido correctamente',
        data: result.secure_url
      };


    } catch (error) {

      handleError(error);
    }



  }

  async findOne(storyId: string, userId: string) {
    try {


      const storyDB = await this.storyModel.findById(storyId)
        .exec();

      if (!storyDB) {
        throw new BadRequestException('La historia no existe');
      }


      // Buscar estadísticas relacionadas con la historia y el usuario
      const stats = await this.statsModel.findOne({ story: storyId, user: userId })
        .populate('story')
        .exec();




      if (!stats) {
        await this.statsModel.create({
          story: storyId,
          user: userId,
          reproductions: 0,
          reproductionsCompletes: 0,
          listenDate: Date.now(),

        });

        return {
          story: {
            ...storyDB.toObject(),
            reproductions: 0,
            reproductionsCompletes: 0,
            isFavorite: false,
          }
        }

      }


      // Construir el objeto de respuesta combinando la historia y las estadísticas
      const response = {
        story: {
          ...storyDB.toObject(), // Convertir el documento Mongoose a un objeto simple
          reproductions: stats.reproductions || 0, // TODO: validar porque en este punto reproductions es undefined
          reproductionsCompletes: stats.reproductionsCompletes || 0,
          isFavorite: stats.isFavorite,
          listenDate: stats.listenDate,
        }
      };

      response.story.id = response.story._id; // Renombrar el campo _id a id
      delete response.story._id; // Elimina el campo _id
      delete response.story.__v; // Elimina el campo __v
      return response;

    } catch (error) {
      handleError(error);
    }
  }

  async update(id: string, updateStoryDto: UpdateStoryDto) {
    try {




      // crear una copia de los parrafos ropiendo la referencia
      const paragraphCopy = JSON.parse(JSON.stringify(updateStoryDto.paragraph));


      const storyDb = await this.storyModel.findById(id).exec();

      if (!storyDb) {
        throw new BadRequestException('The story does not exist');
      }


      let fileToDelete = [];

      // Actualizar imagen si viene


      if (updateStoryDto.paragraph) {
        for (const [index, element] of updateStoryDto.paragraph.entries()) {
          if (element.img && element.img !== (storyDb.paragraph[index] as any).img) {
            const result = await this.fileService.uploadPermanentFile(element.img, updateStoryDto.title);

            if (result instanceof BadRequestException) {
              throw new BadRequestException("Error al subir la imagen");
            }
            updateStoryDto.paragraph[index].img = result.secure_url;
            fileToDelete.push((storyDb.paragraph[index] as any).img);

            console.log('storyDb.paragraph[index] ', (storyDb.paragraph[index] as any).img);
          }
        }

        // Bucle para manejar la actualización de audios
        for (const [index, element] of updateStoryDto.paragraph.entries()) {
          if (element.audio && element.audio !== (storyDb.paragraph[index] as any).audio) {
            const result = await this.fileService.uploadPermanentFile(element.audio, updateStoryDto.title);
            if (result instanceof BadRequestException) {
              throw new BadRequestException("Error al subir el audio");
            }
            updateStoryDto.paragraph[index].audio = result.secure_url;
            fileToDelete.push((storyDb.paragraph[index] as any).audio);
          }

        }

        const updatedStory = await this.storyModel.findByIdAndUpdate(id, updateStoryDto, { new: true });

        // borrar archivos anteriores
        for (const file of fileToDelete) {
          await this.fileService.deletePermanentFile(file);
        }

        return {
          message: 'Historia actualizada correctamente',
          story: updatedStory,
        };
      }

    } catch (error) {
      handleError(error);
    }
  }








  async remove(id: string) {
    try {

      const storyDeled = await this.storyModel.findByIdAndDelete(id);

      if (!storyDeled) {
        throw new BadRequestException('La historia no existe');
      }

      return {
        message: "Historia borrada correctamente",
      };

    } catch (error) {
      handleError(error);
    }


  }

  async restarStory() {

    try {

      // throw new BadRequestException('No se puede restar una historia');

      // borrar tabla de Story
      await this.storyModel.deleteMany({}).exec();

      // insertar datos dummy
      // await this.storyModel.insertMany(storyDummy);

      await this.statsModel.deleteMany({}).exec();

      return {
        message: "Datos dummy insertados correctamente",
        data: storyDummy
      };

    } catch (error) {
      handleError(error);

    }


  }


  /**
   * Stats *********************************
   */

  async addOwnerStoryByUser(storyId: string, userId: string) {

    try {

      const story = await this.storyModel.findById(storyId).exec();
      if (!story) {
        throw new BadRequestException('Story does not exist');
      }

      const stats = await this.statsModel.findOne({ story: storyId, user: userId }).exec();
      if (!stats) {

        await this.statsModel.create({
          story: storyId,
          user: userId,
          isOwner: true
        });

        return {
          message: 'Owner updated successfully',

        };

      }

      stats.isOwner = true;
      stats.listenDate = new Date();

      await stats.save();

      return {
        message: 'Owner updated successfully',
      };

    } catch (error) {
      handleError(error);
    }

  }


  async incremtarReproduccion(storyId: string, userId: string, tipo: string) {


    try {

      const validTypes = ['reproductions', 'reproductionsCompletes']; // reproductionsCompletes
      if (!validTypes.includes(tipo)) {
        throw new BadRequestException(`Tipo de reproducción no válido (${validTypes.join(', ')})`);
      }

      const story = await this.storyModel.findById(storyId).exec();
      if (!story) {
        throw new BadRequestException('La historia no existe');
      }

      const stats = await this.statsModel.findOne({ story: storyId, user: userId }).exec();
      if (!stats) {

        let reproductionsIncrements = {
          reproductions: 0,
          reproductionsCompletes: 0,
          isOwner: true,
        };

        if (tipo === 'reproductionsCompletes') {
          reproductionsIncrements.reproductionsCompletes = 1;
        }

        if (tipo === 'reproductions') {
          reproductionsIncrements.reproductions = 1;
        }

        const statsCreated = await this.statsModel.create({
          story: storyId,
          user: userId,
          ...reproductionsIncrements
        });

        return {
          message: 'Reproducción incrementada correctamente',
          data: statsCreated,
        };

      }

      if (tipo === 'reproductionsCompletes') {
        stats.reproductionsCompletes++;
      }

      if (tipo === 'reproductions') {
        stats.reproductions++;
      }

      stats.isOwner = true;

      await stats.save();

      return {
        message: 'Reproducción incrementada correctamente',
        data: stats,
      };
    } catch (error) {
      handleError(error);
    }
  }



  async findAllByUser(userId: string, querys: IQuerys) {
    try {

      const { orden, category, favoritos , total} = querys;

      this.validateOrden(orden);

      this.validateCategory(category);

      this.validateTotal(total);

      const pipeline: any[] = [
        {
          $match: {
            // Asegúrate de convertir el userId a ObjectId
            user: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'stories',
            localField: 'story',
            foreignField: '_id',
            as: 'story'
          }
        },
        {
          $unwind: '$story'
        },
      ];


      //Filtrar por categoria

      if(category !== 'Todas') {
        pipeline.push({
          $match: {
            'story.categories': category
          }
        });
  
      }

      // filtrar por favoritos
      if(favoritos === 'true') {
        pipeline.push({
          $match: {
            isFavorite: true
          }
        });
      }


      // Si la orden es 'aleatorias', agregamos la etapa $sample al pipeline
      if (orden === 'aleatorias') {
        pipeline.push({
          $sample: { size: 10 },
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

      if(orden === 'antiguas') {
        pipeline.push({
          $sort: {
            listenDate: 1,
          },
        });
      }

      if(orden === 'mas-reproducidas') {
        pipeline.push({
          $sort: {
            reproductions: -1,
          },
        });
      }

      if(orden === 'menos-reproducidas') {
        pipeline.push({
          $sort: {
            reproductions: 1,
          },
        });
      }

      if(orden === 'mas-reproducidas-completas') {
        pipeline.push({
          $sort: {
            reproductionsCompletes: -1,
          },
        });
      }

      if(orden === 'menos-reproducidas-completas') {
        pipeline.push({
          $sort: {
            reproductionsCompletes: 1,
          },
        });
      }

      // Limitar el número de resultados
      pipeline.push({
        $limit: total,
      });


      const storys = await this.statsModel.aggregate(pipeline);

      return {
        storys
      };

    } catch (error) {
      handleError(error);
    }
  }


  async updateFavorite(storyId: string, userId: string) {

    try {

      const story = await this.storyModel.findById(storyId).exec();
      if (!story) {
        throw new BadRequestException('Story does not exist');
      }

      const stats = await this.statsModel.findOne({ story: storyId, user: userId }).exec();
      if (!stats) {

        await this.statsModel.create({
          story: storyId,
          user: userId,
          isFavorite: true
        });

        return {
          message: 'Favorite updated successfully',

        };

      }

      stats.isFavorite = true;

      await stats.save();

      return {
        message: 'Favorite updated successfully',
      };


    } catch (error) {
      handleError(error);
    }

  }






  validateOrden(orden: string) {

    if (!orden) {
      throw new BadRequestException('orden is required');
    }

    if (!this.validOrden.includes(orden)) {
      throw new BadRequestException(`Orden not valid(${this.validOrden.join(', ')})`);
    }
  }


  validateCategory(category: string) {

    if(!category) {
      throw new BadRequestException('category is required'); 
    }


    const currentValidCategorys = categorys.map(category => category.name);
    if (!currentValidCategorys.includes(category) ){
      throw new BadRequestException(`category ${category} not valid (${currentValidCategorys.join(', ')})`);
    }
  }


  validateTotal(total: number) {
    if (!total) {
      throw new BadRequestException('total is required');
    }

    if ( isNaN(total)) {
      throw new BadRequestException('total must be a number');
    }

   

    if (total < 1) {
      throw new BadRequestException('total must be greater than 0');
    }



  }

}
