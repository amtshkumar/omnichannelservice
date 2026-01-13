import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFooterDto {
  @ApiProperty({ example: 'Standard Email Footer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '<div style="background:#333;color:#fff;padding:20px;">© 2024 Company</div>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
