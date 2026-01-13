import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty()
  @IsNumber()
  templateId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bodyText?: string;

  @ApiProperty({ example: 50, description: 'Traffic percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  trafficPercentage: number;
}
