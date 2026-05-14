import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AttachmentsService } from './attachments.service';

const uploadDir = './uploads/articles';

if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

@Controller('attachments')
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post('article/:articleId')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: uploadDir,
                filename: (req, file, callback) => {
                    const uniqueName =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    callback(null, uniqueName + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimeTypes = [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                    'image/png',
                    'image/jpeg',
                    'application/octet-stream',
                ];

                const allowedExtensions = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];

                const fileExtension = extname(file.originalname).toLowerCase();

                const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype);
                const isAllowedExtension = allowedExtensions.includes(fileExtension);

                if (!isAllowedMimeType && !isAllowedExtension) {
                    return callback(
                        new BadRequestException(
                            'Only PDF, DOCX, TXT, PNG, and JPG files are allowed',
                        ),
                        false,
                    );
                }

                callback(null, true);
            },
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
        }),
    )
    uploadFile(
        @Param('articleId') articleId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        return this.attachmentsService.create(Number(articleId), file);
    }

    @Get('article/:articleId')
    findByArticle(@Param('articleId') articleId: string) {
        return this.attachmentsService.findByArticle(Number(articleId));
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.attachmentsService.remove(Number(id));
    }
}