import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class AlertDto {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'This is a required property',
  })
  @IsNumber()
  @IsNotEmpty()
  chain: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'This is a required property',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'This is a required property',
  })
  @IsNumber()
  @IsNotEmpty()
  target_price: number;
}
