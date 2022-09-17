import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
  Req,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { QueryParamsDto } from './dto/query-params.dto';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../auth/entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestType } from '../auth/entities/request.entity';
import { UpdateMyPasswordDto } from './dto/update-my-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { userStorage } from 'src/libs/multer';

@ApiTags('users')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Role(Roles.Admin)
  @Get()
  findAll(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.usersService.findAll({
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
    });
  }

  @Role(Roles.Admin)
  @Get('workers')
  findAllWorkers(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.usersService.findAll({
      where: {
        role: 'worker',
      },
      take: limit ? limit : 50,
      skip: offset ? offset : 0,
    });
  }

  @Role(Roles.Admin)
  @Get('workers/:content')
  findAllWorkersWithContent(
    @Query() queryParams: QueryParamsDto,
    @Param('content') content: string,
  ) {
    const { limit, offset } = queryParams;
    return this.usersService.findAll({
      where: {
        role: 'worker',
        email: {
          contains: content,
        },
      },
      take: limit ? limit : 50,
      skip: offset ? offset : 0,
    });
  }

  @Role(Roles.Admin)
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

  @Role(Roles.Admin, Roles.Customer, Roles.Worker)
  @Post('image/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: userStorage,
    }),
  )
  addImageToUser(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addImageToUser(userId, file);
  }

  @Role(Roles.Admin, Roles.Customer, Roles.Worker)
  @Post('password')
  updateMyPassword(
    @Req() req: RequestType,
    @Body() updateMyPasswordDto: UpdateMyPasswordDto,
  ) {
    return this.usersService.updateMyPassword(req.user.id, updateMyPasswordDto);
  }

  @Role(Roles.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Role(Roles.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
