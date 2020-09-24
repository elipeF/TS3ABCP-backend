import {
  Controller,
  Get,
  Request,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { AuthGuard } from '@nestjs/passport';
import { BotSettings } from 'src/bot';
import { AdminGuard } from 'src/guards/admin.guard';
import { HasUuid } from 'src/has-uuid';
import { Rights } from 'src/rights';

@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  bots(@Request() req) {
    return this.botsService.getBots(req.user, null);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('/')
  botsCreate(@Body() bot: BotSettings, @Request() req) {
    return this.botsService.createBots(bot, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  botEdit(@Body() bot: BotSettings, @Request() req, @Param() params: HasUuid) {
    return this.botsService.editBots(bot, req.user, params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id/start')
  botStart(@Request() req, @Param() params: HasUuid) {
    return this.botsService.startBots(req.user, params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id/stop')
  botStop(@Request() req, @Param() params: HasUuid) {
    return this.botsService.stopBots(req.user, params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  bot(@Request() req, @Param() params: HasUuid) {
    return this.botsService.getBots(req.user, params);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch('/:id/owner')
  botOwnerChange(@Param() params: HasUuid, @Body() body: HasUuid) {
    return this.botsService.botOwnerChange(params, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch('/:id/migrate')
  migrate(@Param() params: HasUuid, @Body() body: HasUuid) {
    return this.botsService.botsMigrate(params, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('/:id')
  botRemove(@Param() params: HasUuid) {
    return this.botsService.removeBot(params);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('/:id/all')
  botsRemove(@Param() params: HasUuid) {
    return this.botsService.removeAllBots(params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id/rights')
  getRights(@Request() req, @Param() params: HasUuid) {
    return this.botsService.getRights(req.user, params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:id/rights')
  addRights(@Body() rights: Rights, @Request() req, @Param() params: HasUuid) {
    return this.botsService.addRights(req.user, params, rights);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id/rights')
  delRights(@Body() rights: Rights, @Request() req, @Param() params: HasUuid) {
    return this.botsService.delRights(req.user, params, rights);
  }
}
