import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLessonProgressDto {
  @ApiProperty({
    description: 'Whether the lesson is completed',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;

  @ApiProperty({
    description: 'Total watch time in seconds',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  watch_time_seconds?: number;

  @ApiProperty({
    description: 'Last playback position in seconds',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  last_position_seconds?: number;

  @ApiProperty({
    description: 'Completion percentage (0-100)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completion_percentage?: number;
}
