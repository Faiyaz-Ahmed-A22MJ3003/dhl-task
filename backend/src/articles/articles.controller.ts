import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: ArticleStatus,
    @Query('tag') tag?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.articlesService.findAll({
      search,
      status,
      tag,
      creatorId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateArticleDto) {
    return this.articlesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateArticleDto) {
    return this.articlesService.update(Number(id), body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateArticleStatusDto) {
    return this.articlesService.updateStatus(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(Number(id));
  }
}