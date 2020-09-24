import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forRoot(process.env.MONGO_URL),
    AuthModule,
    BotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
