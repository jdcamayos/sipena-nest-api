import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignToOrderDto {
  @ApiProperty()
  @IsString()
  readonly assignedBy: string;

  @ApiProperty()
  @IsString()
  readonly orderId: string;

  @ApiProperty()
  @IsString()
  readonly userId: string;
}
