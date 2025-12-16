import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('tiers')
  @ApiOperation({ summary: 'Get all subscription tiers' })
  @ApiResponse({ status: 200, description: 'Returns all active subscription tiers' })
  getAllTiers() {
    return this.subscriptionsService.getAllTiers();
  }

  @Public()
  @Get('tiers/:id')
  @ApiOperation({ summary: 'Get subscription tier by ID' })
  @ApiResponse({ status: 200, description: 'Returns subscription tier details' })
  @ApiResponse({ status: 404, description: 'Tier not found' })
  getTierById(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.getTierById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a tier' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'User already has active subscription' })
  @ApiResponse({ status: 403, description: 'Not eligible for this tier (location restriction)' })
  subscribe(@CurrentUser() user: User, @Body() subscribeDto: SubscribeDto) {
    return this.subscriptionsService.subscribe(user.id, subscribeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active subscription' })
  @ApiResponse({ status: 200, description: 'Returns active subscription' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getUserActiveSubscription(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription history' })
  @ApiResponse({ status: 200, description: 'Returns subscription history' })
  getMyHistory(@CurrentUser() user: User) {
    return this.subscriptionsService.getUserSubscriptionHistory(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel active subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  cancelSubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-payment/:subscriptionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment for subscription (Admin/Manual)' })
  @ApiResponse({ status: 200, description: 'Payment confirmed, subscription activated' })
  confirmPayment(@Param('subscriptionId', ParseUUIDPipe) subscriptionId: string) {
    return this.subscriptionsService.confirmPayment(subscriptionId);
  }
}
