import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
// import { CreateOrderDto } from './create-order.dto';

// export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
export class UpdateOrderDto {
  @ApiProperty()
  @IsBoolean()
  readonly status: boolean;
}
