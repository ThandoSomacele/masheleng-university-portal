import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller({ path: 'insurance', version: '1' })
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('policies')
  create(@Request() req, @Body() createDto: CreateInsurancePolicyDto) {
    return this.insuranceService.createPolicy(req.user.sub, createDto);
  }

  @Get('policies/my')
  findMyPolicies(@Request() req) {
    return this.insuranceService.findAllByUser(req.user.sub);
  }

  @Get('policies/:id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.insuranceService.findOne(id, req.user.sub);
  }

  @Patch('policies/:id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.insuranceService.cancelPolicy(id, req.user.sub);
  }

  // Admin routes
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/policies')
  findAll() {
    return this.insuranceService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/policies/pending')
  findPending() {
    return this.insuranceService.getPendingPolicies();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/statistics')
  getStatistics() {
    return this.insuranceService.getStatistics();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/policies/:id/approve')
  approve(@Param('id') id: string) {
    return this.insuranceService.approvePolicy(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/policies/:id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.insuranceService.rejectPolicy(id, reason);
  }
}
