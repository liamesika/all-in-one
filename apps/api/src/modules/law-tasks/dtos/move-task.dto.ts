import { IsString, IsNumber, IsIn } from 'class-validator';

export class MoveTaskDto {
  @IsIn(['todo', 'in_progress', 'review', 'done'])
  boardColumn: string;

  @IsNumber()
  boardOrder: number;
}
