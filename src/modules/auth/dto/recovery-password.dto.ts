import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RecoveryPasswordDto {
  @ApiProperty()
  @IsString()
  @Length(6)
  @IsNotEmpty()
  readonly password: string;
}
