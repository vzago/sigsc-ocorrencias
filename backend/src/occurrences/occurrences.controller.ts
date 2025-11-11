import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OccurrencesService } from './occurrences.service';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { FilterOccurrenceDto } from './dto/filter-occurrence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('occurrences')
@UseGuards(JwtAuthGuard)
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Post()
  create(@Body() createOccurrenceDto: CreateOccurrenceDto) {
    return this.occurrencesService.create(createOccurrenceDto);
  }

  @Get()
  findAll(@Query() filters: FilterOccurrenceDto) {
    return this.occurrencesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.occurrencesService.findOne(id);
  }

  @Get('ra/:raNumber')
  findByRANumber(@Param('raNumber') raNumber: string) {
    return this.occurrencesService.findByRANumber(raNumber);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOccurrenceDto: UpdateOccurrenceDto,
  ) {
    return this.occurrencesService.update(id, updateOccurrenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.occurrencesService.remove(id);
  }
}

