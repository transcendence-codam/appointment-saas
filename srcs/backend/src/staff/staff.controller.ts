import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DevAuthGuard } from '../common/guards/dev-auth.guard.js';
import { StaffService } from './staff.service.js';
import { StaffResponseDto } from './dto/staff-response.dto.js';
import { ListStaffQueryDto } from './dto/list-staff-query.dto.js';
import { TenantId } from '../common/decorators/tenant-id.decorator.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateStaffDto } from './dto/update-staff.dto.js';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(DevAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  // GET request for /staff
  @Get()
  @ApiOperation({ summary: 'List staff for the active business' })
  @ApiOkResponse({ type: StaffResponseDto, isArray: true })
  list(@TenantId() tenantId: string, @Query() query: ListStaffQueryDto) {
    return this.staff.list(tenantId, query.includeArchived);
  }

  // GET request for /staff/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get one staff member (archived staff are still readable' })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiNotFoundResponse()
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.staff.findOne(tenantId, id);
  }

  // POST request for /staff
  @Post()
  @ApiOperation({ summary: 'Create a staff member' })
  @ApiCreatedResponse({ type: StaffResponseDto })
  create(@TenantId() tenantId: string, @Body() dto: CreateStaffDto) {
    return this.staff.create(tenantId, dto);
  }

  // PATCH request for /staff/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff member' })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiNotFoundResponse()
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staff.update(tenantId, id, dto);
  }

  // PATCH request for /staff/:id/archive
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a staff member (is_active = false)' })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiNotFoundResponse()
  archive(@TenantId() tenantId: string, @Param(':id', ParseUUIDPipe) id: string) {
    return this.staff.archive(tenantId, id);
  }

  // PATCH request for /staff/:id/restore
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore an archive staff member' })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiNotFoundResponse()
  restore(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.staff.restore(tenantId, id);
  }
}
