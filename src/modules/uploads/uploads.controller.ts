import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('uploads')
export class UploadsController {
  // ToDo: Make private with role access
  @Get(':orderId/:imgName')
  findOne(
    @Param() params: { orderId: string; imgName: string },
    @Res() res: Response,
  ) {
    const { imgName, orderId } = params;
    return res.sendFile(imgName, { root: join('uploads', orderId) });
  }
}
