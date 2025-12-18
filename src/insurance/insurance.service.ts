import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsurancePolicy, InsuranceStatus } from './entities/insurance-policy.entity';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsurancePolicy)
    private insurancePolicyRepository: Repository<InsurancePolicy>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async createPolicy(
    userId: string,
    createDto: CreateInsurancePolicyDto,
  ): Promise<InsurancePolicy> {
    // Check if user already has an active policy of this type
    const existingPolicy = await this.insurancePolicyRepository.findOne({
      where: {
        userId,
        type: createDto.type,
        status: InsuranceStatus.ACTIVE,
      },
    });

    if (existingPolicy) {
      throw new BadRequestException(
        `You already have an active ${createDto.type} insurance policy`,
      );
    }

    // Create policy
    const policy = this.insurancePolicyRepository.create({
      ...createDto,
      userId,
      status: InsuranceStatus.PENDING,
    });

    const savedPolicy = await this.insurancePolicyRepository.save(policy);

    // Submit to underwriter for approval
    try {
      await this.submitToUnderwriter(savedPolicy);
    } catch (error) {
      console.error('Failed to submit to underwriter:', error.message);
      // Don't fail the policy creation, just log the error
    }

    return savedPolicy;
  }

  async findAllByUser(userId: string): Promise<InsurancePolicy[]> {
    return this.insurancePolicyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<InsurancePolicy> {
    const policy = await this.insurancePolicyRepository.findOne({
      where: { id, userId },
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    return policy;
  }

  async cancelPolicy(id: string, userId: string): Promise<InsurancePolicy> {
    const policy = await this.findOne(id, userId);

    if (policy.status === InsuranceStatus.CANCELLED) {
      throw new BadRequestException('Policy is already cancelled');
    }

    if (policy.status !== InsuranceStatus.ACTIVE) {
      throw new BadRequestException('Only active policies can be cancelled');
    }

    policy.status = InsuranceStatus.CANCELLED;
    return this.insurancePolicyRepository.save(policy);
  }

  async approvePolicy(id: string): Promise<InsurancePolicy> {
    const policy = await this.insurancePolicyRepository.findOne({
      where: { id },
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    if (policy.status !== InsuranceStatus.PENDING) {
      throw new BadRequestException('Only pending policies can be approved');
    }

    // Generate policy number
    policy.policyNumber = this.generatePolicyNumber(policy.type);
    policy.status = InsuranceStatus.ACTIVE;
    policy.startDate = new Date();

    // Set end date (1 year from now for education insurance)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    policy.endDate = endDate;

    policy.underwriterData = {
      ...policy.underwriterData,
      approvedAt: new Date(),
    };

    return this.insurancePolicyRepository.save(policy);
  }

  async rejectPolicy(id: string, reason: string): Promise<InsurancePolicy> {
    const policy = await this.insurancePolicyRepository.findOne({
      where: { id },
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    if (policy.status !== InsuranceStatus.PENDING) {
      throw new BadRequestException('Only pending policies can be rejected');
    }

    policy.status = InsuranceStatus.REJECTED;
    policy.notes = reason;

    return this.insurancePolicyRepository.save(policy);
  }

  private async submitToUnderwriter(policy: InsurancePolicy): Promise<void> {
    const underwriterUrl = this.configService.get<string>('UNDERWRITER_API_URL');
    const underwriterKey = this.configService.get<string>('UNDERWRITER_API_KEY');

    if (!underwriterUrl) {
      console.warn('Underwriter API URL not configured');
      return;
    }

    try {
      interface UnderwriterResponse {
        underwriterId: string;
        riskScore: number;
        notes: string;
      }

      const response = await firstValueFrom(
        this.httpService.post<UnderwriterResponse>(
          `${underwriterUrl}/policies/review`,
          {
            policyId: policy.id,
            type: policy.type,
            premium: policy.premium,
            coverageAmount: policy.coverageAmount,
            beneficiaries: policy.beneficiaries,
            medicalInfo: policy.medicalInfo,
          },
          {
            headers: {
              'Authorization': `Bearer ${underwriterKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Update policy with underwriter data
      await this.insurancePolicyRepository.update(policy.id, {
        underwriterData: {
          underwriterId: response.data.underwriterId,
          riskScore: response.data.riskScore,
          notes: response.data.notes,
        },
      });
    } catch (error) {
      console.error('Underwriter submission failed:', (error as Error).message);
      throw error;
    }
  }

  private generatePolicyNumber(type: string): string {
    const prefix = type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  // Admin methods
  async findAll(): Promise<InsurancePolicy[]> {
    return this.insurancePolicyRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingPolicies(): Promise<InsurancePolicy[]> {
    return this.insurancePolicyRepository.find({
      where: { status: InsuranceStatus.PENDING },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getStatistics() {
    const [
      totalPolicies,
      activePolicies,
      pendingPolicies,
      totalPremiums,
    ] = await Promise.all([
      this.insurancePolicyRepository.count(),
      this.insurancePolicyRepository.count({
        where: { status: InsuranceStatus.ACTIVE },
      }),
      this.insurancePolicyRepository.count({
        where: { status: InsuranceStatus.PENDING },
      }),
      this.insurancePolicyRepository
        .createQueryBuilder('policy')
        .select('SUM(policy.premium)', 'total')
        .where('policy.status = :status', { status: InsuranceStatus.ACTIVE })
        .getRawOne(),
    ]);

    return {
      totalPolicies,
      activePolicies,
      pendingPolicies,
      totalPremiums: parseFloat(totalPremiums?.total || '0'),
    };
  }
}
