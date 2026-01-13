import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateHeaderDto {
  @ApiProperty({ example: 'Standard Email Header' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '<div style="background:#f0f0f0;padding:20px;"><img src="logo.png" /></div>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
