import { Module, HttpModule } from '@nestjs/common';
import { BotsService } from './bots.service';
import { BotsController } from './bots.controller';
import { BotSchema } from './bots.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bot', schema: BotSchema }]), HttpModule],
  providers: [BotsService],
  controllers: [BotsController],
})
export class BotsModule { }
