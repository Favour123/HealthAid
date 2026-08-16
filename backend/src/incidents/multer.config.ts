import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export const incidentImageMulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => {
      const uniqueName = `${uuid()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return callback(new BadRequestException('Only image files (jpg, png, webp) are allowed'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
};
