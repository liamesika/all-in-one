import { Module } from '@nestjs/common';
import { LawDocumentsController } from './law-documents.controller';
import { LawDocumentsService } from './law-documents.service';
import { StorageService } from '../real-estate-properties/storage.service';

@Module({
  imports: [],
  controllers: [LawDocumentsController],
  providers: [LawDocumentsService, StorageService],
  exports: [LawDocumentsService],
})
export class LawDocumentsModule {}
