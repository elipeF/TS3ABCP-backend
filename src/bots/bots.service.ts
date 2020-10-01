import {
  Injectable,
  HttpService,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBot } from './bot.interface';
import { AxiosError } from 'axios';
import { BotSettings } from 'src/bot';
import { v4 } from 'uuid';
import { Rights } from 'src/rights';

@Injectable()
export class BotsService {
  constructor(
    @InjectModel('Bot') private botModel: Model<IBot>,
    private httpService: HttpService,
  ) {}

  async getBots(req, params) {
    let searchById = {};
    if (params) {
      searchById = { _id: params.id };
    }
    let query: IBot[];
    const response = [];
    if (req.admin) {
      query = await this.botModel.find({ ...searchById }).exec();
    } else {
      query = await this.botModel.find({ owner: req.id, ...searchById }).exec();
    }

    if (query.length > 0) {
      for (const bot of query) {
        try {
          const botstatus = await this.httpService
            .get(process.env.AUDIOBOT_API + 'bot/' + bot.id)
            .toPromise();
          response.push({ id: bot.id, owner: bot.owner, ...botstatus.data });
        } catch (e) {
          const er: AxiosError = e;
          if (er.response && er.response.status === 404) {
            await this.botModel.deleteOne({ _id: bot.id });
          } else {
            throw new HttpException(
              er.message,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }
    }

    if (params) {
      if (query.length > 0) {
        return response[0];
      } else {
        throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
      }
    }
    return response;
  }

  async getRights(req, params) {
    let searchById = {};
    if (params) {
      searchById = { _id: params.id };
    }
    let query: IBot[];
    if (req.admin) {
      query = await this.botModel.find({ ...searchById }).exec();
    } else {
      query = await this.botModel.find({ owner: req.id, ...searchById }).exec();
    }

    if (query.length > 0) {
      try {
        const bot = await this.httpService
          .get(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/rights')
          .toPromise();
        if (req.admin) {
          return { ...bot.data };
        } else {
          const { admins, ...rest } = bot.data;
          return { ...rest };
        }
      } catch (e) {
        const er: AxiosError = e;
        throw new HttpException(er.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
    }
  }

  async addRights(req, params, body: Rights) {
    if (!req.admin && body.type === 'admin') {
      throw new HttpException('Missing righrs', HttpStatus.UNAUTHORIZED);
    }
    let query: IBot[];
    if (req.admin) {
      query = await this.botModel.find({ _id: params.id }).exec();
    } else {
      query = await this.botModel
        .find({ owner: req.id, _id: params.id })
        .exec();
    }

    if (body.useruid) {
      const bot = await this.httpService
        .post(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/rights', {
          level: body.type,
          useruid: body.useruid,
        })
        .toPromise();
      return bot.data;
    }

    if (body.groupid) {
      const bot = await this.httpService
        .post(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/rights', {
          level: body.type,
          groupid: body.groupid,
        })
        .toPromise();
      return bot.data;
    }
  }

  async delRights(req, params, body: Rights) {
    if (!req.admin && body.type === 'admin') {
      throw new HttpException('Missing righrs', HttpStatus.UNAUTHORIZED);
    }
    let query: IBot[];
    if (req.admin) {
      query = await this.botModel.find({ _id: params.id }).exec();
    } else {
      query = await this.botModel
        .find({ owner: req.id, _id: params.id })
        .exec();
    }

    if (body.useruid) {
      const bot = await this.httpService
        .patch(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/rights', {
          level: body.type,
          useruid: body.useruid,
        })
        .toPromise();
      return bot.data;
    }

    if (body.groupid) {
      const bot = await this.httpService
        .patch(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/rights', {
          level: body.type,
          groupid: body.groupid,
        })
        .toPromise();
      return bot.data;
    }
  }

  async createBots(bot: BotSettings, owner) {
    const number = bot.count ? bot.count : 1;
    const addressNew = bot.address ? bot.address : 'localhost';
    const botOwner = bot.owner ? bot.owner : owner;
    const response = [];
    for (let i = 0; i < number; i++) {
      const id = v4();
      try {
        const req = await this.httpService
          .post(process.env.AUDIOBOT_API + 'bot', { id })
          .toPromise();
        if (req.status === 201) {
          const { count, owner, address, ...rest } = bot;
          await new this.botModel({
            _id: id,
            server: addressNew,
            owner: botOwner,
          }).save();
          await this.httpService
            .patch(process.env.AUDIOBOT_API + 'bot/' + id, {
              ...rest,
              address: addressNew,
            })
            .toPromise();
          response.push({ id, ...rest });
        } else {
          throw new HttpException(
            'Unable to create bot',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } catch (e) {
        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    return response;
  }

  async editBots(settings: BotSettings, req, params) {
    const { count, ...props } = settings;
    let query: IBot[];
    if (req.admin) {
      query = await this.botModel.find({ _id: params.id }).exec();
    } else {
      query = await this.botModel
        .find({ owner: req.id, _id: params.id })
        .exec();
    }

    if (query.length > 0) {
      try {
        await this.httpService
          .patch(process.env.AUDIOBOT_API + 'bot/' + query[0].id, props)
          .toPromise();
        return { id: query[0].id, ...params };
      } catch (e) {
        const er: AxiosError = e;
        throw new HttpException(
          er.response.data.message ? er.response.data.message : er.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
    }
  }

  async startBots(req, body) {
    for (const id of body.ids) {
      let query: IBot[];
      if (req.admin) {
        query = await this.botModel.find({ _id: id }).exec();
      } else {
        query = await this.botModel.find({ owner: req.id, _id: id }).exec();
      }

      if (query.length > 0) {
        try {
          await this.httpService
            .get(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/start')
            .toPromise();
        } catch (e) {
          const er: AxiosError = e;
          throw new HttpException(er.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  async stopBots(req, body) {
    for (const id of body.ids) {
      let query: IBot[];
      if (req.admin) {
        query = await this.botModel.find({ _id: id }).exec();
      } else {
        query = await this.botModel.find({ owner: req.id, _id: id }).exec();
      }

      if (query.length > 0) {
        try {
          await this.httpService
            .get(process.env.AUDIOBOT_API + 'bot/' + query[0].id + '/stop')
            .toPromise();
        } catch (e) {
          const er: AxiosError = e;
          throw new HttpException(er.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  async removeBot(params) {
    const query = await this.botModel.find({ _id: params.id }).exec();
    if (query.length > 0) {
      try {
        await this.httpService
          .delete(process.env.AUDIOBOT_API + 'bot/' + query[0].id)
          .toPromise();
        await this.botModel.deleteOne({ _id: params.id });
        return true;
      } catch (e) {
        const er: AxiosError = e;
        throw new HttpException(er.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
    }
  }

  async removeAllBots(params) {
    const query = await this.botModel.find({ owner: params.id }).exec();
    if (query.length > 0) {
      for (const bot of query) {
        try {
          await this.httpService
            .delete(process.env.AUDIOBOT_API + 'bot/' + bot.id)
            .toPromise();
          await this.botModel.deleteOne({ _id: bot.id });
        } catch (e) {
          const er: AxiosError = e;
          throw new HttpException(er.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    } else {
      throw new HttpException('0 bots', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  async botsMigrate(params, body) {
    const query = await this.botModel.find({ owner: params.id }).exec();
    if (query.length > 0) {
      for (const bot of query) {
        await this.botModel.updateOne({ _id: bot.id }, { owner: body.id });
      }
    } else {
      throw new HttpException('0 bots', HttpStatus.NOT_FOUND);
    }
    return true;
  }

  async botOwnerChange(params, body) {
    const query = await this.botModel.find({ _id: params.id }).exec();
    if (query.length > 0) {
      await this.botModel.updateOne({ _id: params.id }, { owner: body.id });
      return true;
    } else {
      throw new HttpException('Bot not found', HttpStatus.NOT_FOUND);
    }
  }
}
