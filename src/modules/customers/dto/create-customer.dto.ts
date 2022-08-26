import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly companyName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly streetAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly postalCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly phone: string;
}
