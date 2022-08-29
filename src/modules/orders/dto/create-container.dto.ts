import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContainerDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  type: '20ft' | '40ft';

  @ApiProperty()
  @IsString()
  contain: string;

  @ApiProperty()
  @IsNumber()
  productQuantity: number;

  @ApiProperty()
  @IsNumber()
  productWeight: number;

  @ApiProperty()
  @IsBoolean()
  forkliftOperator: boolean;

  @ApiProperty()
  @IsBoolean()
  stretchWrap: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  additionalInfo: string;
}
