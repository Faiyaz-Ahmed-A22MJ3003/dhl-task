import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { CreateAutomationRunDto } from './dto/create-automation-run.dto';
import { UpdateAutomationRunDto } from './dto/update-automation-run.dto';
import { CreateAutomationLogDto } from './dto/create-automation-log.dto';

@Controller('automation')
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Post('runs')
    createRun(@Body() body: CreateAutomationRunDto) {
        return this.automationService.createRun(body);
    }

    @Get('runs')
    findAllRuns() {
        return this.automationService.findAllRuns();
    }

    @Get('runs/:id')
    findRunById(@Param('id') id: string) {
        return this.automationService.findRunById(Number(id));
    }

    @Patch('runs/:id')
    updateRun(@Param('id') id: string, @Body() body: UpdateAutomationRunDto) {
        return this.automationService.updateRun(Number(id), body);
    }

    @Post('logs')
    createLog(@Body() body: CreateAutomationLogDto) {
        return this.automationService.createLog(body);
    }

    @Get('runs/:id/logs')
    findLogsByRun(@Param('id') id: string) {
        return this.automationService.findLogsByRun(Number(id));
    }
}