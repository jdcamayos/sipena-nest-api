import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateContainerDto } from './create-container.dto';

export class Container extends OmitType(CreateContainerDto, ['orderId']) {}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly customerId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  readonly date: Date | string;

  @ApiProperty()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Container)
  readonly containers: Container[];
}
