import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ServiceResponseDto } from "./dto/service-response.dto.js";
import { TenantId } from "../common/decorators/tenant-id.decorator.js";
import { ServicesService } from "./services.service.js";
import { ListServicesQueryDto } from "./dto/list-services-query.dto.js";
import { CreateServiceDto } from "./dto/create-service.dto.js";
import { UpdateServiceDto } from "./dto/update-service.dto.js";

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
    constructor(private readonly services: ServicesService) {}
    
    // GET request for /services
    @Get()
    @ApiOperation({ summary: 'List services for the active business' })
    @ApiOkResponse({ type: ServiceResponseDto, isArray: true })
    list(@TenantId() tenantId: string, @Query() query: ListServicesQueryDto) {
        return this.services.list(tenantId, query.includeArchived);
    }

    // GET request for /services/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get one service (archived services are still readable)' })
    @ApiOkResponse({ type: ServiceResponseDto })
    @ApiNotFoundResponse()
    findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.services.findOne(tenantId, id);
    }

    // POST request for /services
    @Post()
    @ApiOperation({ summary: 'Create a service'})
    @ApiCreatedResponse({ type: ServiceResponseDto })
    create(@TenantId() tenantId: string, @Body() dto: CreateServiceDto) {
        return this.services.create(tenantId, dto)
    }

    // PATCH request for /services/:id
    @Patch(':id')
    @ApiOperation({ summary: 'Update a service' })
    @ApiOkResponse({ type: ServiceResponseDto})
    @ApiNotFoundResponse()
    update(
        @TenantId() tenantId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateServiceDto,
    ) {
        return this.services.update(tenantId, id, dto);
    }

    // PATCH request for /services/:id/archive
    @Patch(':id/archive')
    @ApiOperation({ summary: 'Archive a service (is_active = false)' })
    @ApiOkResponse({ type: ServiceResponseDto })
    @ApiNotFoundResponse()
    archive(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.services.archive(tenantId, id);
    }

    // PATCH request for /services/:id/restore
    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore an archived service' })
    @ApiOkResponse({ type: ServiceResponseDto })
    @ApiNotFoundResponse()
    restore(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.services.restore(tenantId, id);
    }

    // DELETE request for /services/:id
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a service that has never been booked' })
    @ApiNoContentResponse()
    @ApiNotFoundResponse()
    @ApiConflictResponse({ description: 'Service has appoinments: archive it instead '})
    remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.services.remove(tenantId, id);
    }
}
