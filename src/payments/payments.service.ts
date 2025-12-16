import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { UserSubscription, SubscriptionStatus } from '../subscriptions/entities/user-subscription.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepository: Repository<UserSubscription>,
  ) {}

  async createPayment(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    // Verify subscription exists and belongs to user
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        id: createPaymentDto.subscription_id,
        user_id: userId,
      },
      relations: ['tier'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = this.paymentRepository.create({
      user_id: userId,
      subscription_id: createPaymentDto.subscription_id,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency,
      status: PaymentStatus.PENDING,
      payment_method: createPaymentDto.payment_method || PaymentMethod.MANUAL,
      payment_reference: paymentReference,
      notes: createPaymentDto.notes,
    });

    return await this.paymentRepository.save(payment);
  }

  async confirmPayment(
    paymentId: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    // Update payment
    payment.status = PaymentStatus.COMPLETED;
    payment.paid_at = new Date();

    if (confirmPaymentDto.external_transaction_id) {
      payment.external_transaction_id = confirmPaymentDto.external_transaction_id;
    }

    if (confirmPaymentDto.notes) {
      payment.notes = payment.notes
        ? `${payment.notes}\n${confirmPaymentDto.notes}`
        : confirmPaymentDto.notes;
    }

    await this.paymentRepository.save(payment);

    // Update subscription status to active
    if (payment.subscription) {
      payment.subscription.status = SubscriptionStatus.ACTIVE;
      payment.subscription.months_unpaid = 0;
      await this.subscriptionRepository.save(payment.subscription);
    }

    return payment;
  }

  async markPaymentFailed(
    paymentId: string,
    failureReason: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.FAILED;
    payment.failure_reason = failureReason;

    return await this.paymentRepository.save(payment);
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { user_id: userId },
      relations: ['subscription', 'subscription.tier'],
      order: { created_at: 'DESC' },
    });
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['subscription', 'subscription.tier', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { subscription_id: subscriptionId },
      order: { created_at: 'DESC' },
    });
  }

  async getPendingPayments(userId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: {
        user_id: userId,
        status: PaymentStatus.PENDING,
      },
      relations: ['subscription', 'subscription.tier'],
      order: { created_at: 'DESC' },
    });
  }
}
