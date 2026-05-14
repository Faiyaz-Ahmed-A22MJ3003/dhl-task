import { Body, Controller, Get, Post } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Get()
    findAll() {
        return this.tagsService.findAll();
    }

    @Post()
    create(@Body() body: { name: string }) {
        return this.tagsService.create(body.name);
    }
}