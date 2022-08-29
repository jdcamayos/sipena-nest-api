import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  uploadBy: string;

  @ApiProperty()
  @IsString()
  fieldname: string;

  @ApiProperty()
  @IsString()
  originalname: string;

  @ApiProperty()
  @IsString()
  encoding: string;

  @ApiProperty()
  @IsString()
  mimetype: string;

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsString()
  path: string;
}
