import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Req, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtValidateGuard } from '../guard/jwt-validate/jwt-validate.guard';
import { AdminValidateGuard } from '../guard/admin-validate/admin-validate.guard';


@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return this.fileService.create(createFileDto);
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }



  @UseGuards(
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Post('upload-temporal-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadTemporalFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.uploadTemporalFile(file);
  }



  @UseGuards(
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Delete('delete-temporal-file')
  deleteTemporalFile(
    @Req() request,
  ) {

    const { public_id } = request.body;

    return this.fileService.deleteTemporalFile(public_id);
  }




  @UseGuards(
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Delete('delete-all-temporal-files')
  deleteAllTemporalFiles() {
    return this.fileService.deleteAllTemporalFiles();

  }


  @UseGuards(
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Post('upload-permanent-file')
  uploadPermanentFile(@Req() request) {
    const { temporalPath, titleStory } = request.query;
    return this.fileService.uploadPermanentFile(temporalPath, titleStory);
  }

  @UseGuards(
    JwtValidateGuard,
    AdminValidateGuard
  )
  @Delete('delete-permanent-file')
  deletePermanentFile(@Req() request) {
    const { publicId } = request.query;
    return this.fileService.deletePermanentFile(publicId);
  }


}
