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
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../auth/decorators/role.decorator';
import { RequestType } from '../auth/entities/request.entity';
import { Roles } from '../auth/entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Role(Roles.Customer)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Role(Roles.Admin)
  @Get()
  findAll(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.customersService.findAll({
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
    });
  }

  @Role(Roles.Customer)
  @Get('/me')
  findMe(@Req() req: RequestType) {
    return this.customersService.findByUserId(req.user.id);
  }

  @Role(Roles.Customer)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Role(Roles.Customer)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Role(Roles.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
