import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  createPayment(
    @CurrentUser() user: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(user.id, createPaymentDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment (Manual/Admin)' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Payment already completed' })
  confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirmPayment(id, confirmPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Returns payment history' })
  getUserPayments(@CurrentUser() user: User) {
    return this.paymentsService.getUserPayments(user.id);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending payments' })
  @ApiResponse({ status: 200, description: 'Returns pending payments' })
  getPendingPayments(@CurrentUser() user: User) {
    return this.paymentsService.getPendingPayments(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  getPaymentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get payments for a subscription' })
  @ApiResponse({ status: 200, description: 'Returns subscription payments' })
  getSubscriptionPayments(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ) {
    return this.paymentsService.getSubscriptionPayments(subscriptionId);
  }
}
