import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../auth/entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestType } from '../auth/entities/request.entity';
import { AssignWorkerToOrderDto } from './dto/assign-worker-to-order.dto';
import { WorkersService } from '../workers/workers.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { orderStorage } from 'src/libs/multer';
import { AttachmentsService } from '../attachments/attachments.service';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from 'src/libs/mail/mail.service';

@ApiTags('orders')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly commentsService: CommentsService,
    private readonly ordersService: OrdersService,
    private readonly workersService: WorkersService,
    private readonly mailService: MailService,
  ) {}

  @Role(Roles.Customer)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Role(Roles.Admin)
  @Get()
  findAll(@Query() queryParams: QueryParamsDto) {
    const { limit, offset } = queryParams;
    return this.ordersService.findAll({
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
    });
  }

  @Role(Roles.Customer)
  @Get('customers')
  findAllByCustomer(
    @Req() req: RequestType,
    @Query() queryParams: QueryParamsDto,
  ) {
    const { limit, offset } = queryParams;
    const { user } = req;
    return this.ordersService.findAll({
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
      where: {
        customer: {
          userId: user.id,
        },
      },
    });
  }

  @Role(Roles.Worker)
  @Get('workers')
  findAllByWorker(
    @Req() req: RequestType,
    @Query() queryParams: QueryParamsDto,
  ) {
    const { limit, offset } = queryParams;
    return this.ordersService.findAll({
      take: limit ? limit : 10,
      skip: offset ? offset : 0,
      where: {
        workers: {
          some: {
            userId: req.user.id,
          },
        },
      },
    });
  }

  @Role(Roles.Admin)
  @Post(':orderId/workers')
  assignWorkerToOrder(
    @Param('orderId') orderId: string,
    @Req() req: RequestType,
    @Body() assignWorkerToOrderDto: AssignWorkerToOrderDto,
  ) {
    const assignToOrderDto = {
      assignedBy: req.user.id,
      userId: assignWorkerToOrderDto.userId,
      orderId,
    };
    return this.workersService.assignToOrder(assignToOrderDto);
  }

  @Role(Roles.Admin, Roles.Worker)
  @Post(':orderId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: orderStorage,
    }),
  )
  addFilesToOrder(
    @Param('orderId') orderId: string,
    @Req() req: RequestType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { buffer, ...restFile } = file;
    return this.attachmentsService.create({
      uploadBy: req.user.id,
      ...restFile,
      orderId,
    });
  }

  @Role(Roles.Admin, Roles.Customer, Roles.Worker)
  @Post(':orderId/comments')
  addCommentToOrder(
    @Param('orderId') orderId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestType,
  ) {
    return this.commentsService.create({
      orderId,
      userId: req.user.id,
      ...createCommentDto,
    });
  }

  @Role(Roles.Admin, Roles.Worker)
  @Get(':orderId/finish')
  finishOrder(@Param('orderId') orderId: string, @Req() req: RequestType) {
    // console.log('User has finished an order', req.user.id);
    this.mailService.finishedOrderMail({ orderId, userId: req.user.id });
    return this.ordersService.update(orderId, {
      status: true,
    });
  }

  @Role(Roles.Admin, Roles.Customer, Roles.Worker)
  @Get(':orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Role(Roles.Admin, Roles.Worker)
  @Patch(':orderId')
  update(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(orderId, updateOrderDto);
  }

  @Role(Roles.Admin)
  @Delete(':orderId')
  remove(@Param('orderId') orderId: string) {
    return this.ordersService.remove(orderId);
  }
}
