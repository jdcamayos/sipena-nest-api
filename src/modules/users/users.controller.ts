import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { QueryParamsDto } from './dto/query-params.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.usersService.findAll({
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
    });
  }

  @Get('workers')
  findAllWorkers(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.usersService.findAll({
      where: {
        role: 'worker',
      },
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
    });
  }

  @Get('customers')
  findAllCustomers(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.usersService.findAll({
      where: {
        role: 'customer',
      },
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
