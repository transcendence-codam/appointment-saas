import { Module } from "@nestjs/common";
import { ServicesController } from "./services.controller.js";
import { ServicesService } from "./services.service.js";

@Module({
    controllers: [ServicesController],
    providers: [ServicesService],
    exports: [ServicesService],
})

export class ServicesModule {}