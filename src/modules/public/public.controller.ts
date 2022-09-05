import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';

@ApiTags('public')
@Controller('public')
export class PublicController {
  @Get(':userId/:imgName')
  findOne(
    @Param() params: { userId: string; imgName: string },
    @Res() res: Response,
  ) {
    const { userId, imgName } = params;
    return res.sendFile(imgName, { root: join('public', userId) });
  }
}
