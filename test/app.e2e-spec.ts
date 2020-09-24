import * as dotenv from 'dotenv';
dotenv.config();
import * as request from 'supertest';
import * as mongoose from 'mongoose';
const app = 'http://localhost:8081';

const user = { username: 'Tester', id: undefined, token: undefined };
const admin = { username: 'Admin', id: undefined, token: undefined };
let bot1Id;
let bot2Id;

beforeAll(() => {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true },
    function() {
      /* Drop the DB */
      mongoose.connection.db.dropDatabase();
    },
  );
});

describe('App', () => {
  it('Should ping', () => {
    return request(app)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Auth', () => {
  it('Should register user', () => {
    return request(app)
      .post('/auth/register')
      .send({ name: user.username, password: 'test123' })
      .expect(({ body }) => {
        console.log(body);
        expect(body.id).toBeDefined();
        expect(body.username).toBe(user.username);
        expect(body.password).toBeUndefined();
        expect(body.salt).toBeUndefined();
        expect(body.hash).toBeUndefined();
        expect(body.admin).toBeUndefined();
        user.id = body.id;
      })
      .expect(201);
  });
  it('Should register 2 user', () => {
    return request(app)
      .post('/auth/register')
      .send({ name: admin.username, password: 'test123' })
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.username).toBe(admin.username);
        expect(body.password).toBeUndefined();
        expect(body.salt).toBeUndefined();
        expect(body.hash).toBeUndefined();
        expect(body.admin).toBeUndefined();
        admin.id = body.id;
      })
      .expect(201);
  });
  it('Should set 2 user as admin', () => {
    return new Promise((resolve, reject) => {
      mongoose.connection.db.collection('users', function(err, collection) {
        collection.update(
          { username: admin.username },
          { $set: { admin: true } },
        );
        resolve();
      });
    });
  });
  it('Should return user auth token', () => {
    return request(app)
      .post('/auth/login')
      .send({ name: user.username, password: 'test123' })
      .expect(({ body }) => {
        expect(body.access_token).toBeDefined();
        expect(body.password).toBeUndefined();
        expect(body.salt).toBeUndefined();
        expect(body.hash).toBeUndefined();
        expect(body.admin).toBeUndefined();
        user.token = body.access_token;
      })
      .expect(201);
  });
  it('Should return admin auth token', () => {
    return request(app)
      .post('/auth/login')
      .send({ name: admin.username, password: 'test123' })
      .expect(({ body }) => {
        expect(body.access_token).toBeDefined();
        expect(body.password).toBeUndefined();
        expect(body.salt).toBeUndefined();
        expect(body.hash).toBeUndefined();
        expect(body.admin).toBeUndefined();
        admin.token = body.access_token;
      })
      .expect(201);
  });
  it('Should not return auth token', () => {
    return request(app)
      .post('/auth/login')
      .send({ name: user.username, password: '3213213213123' })
      .expect(({ body }) => {
        expect(body.password).toBeUndefined();
        expect(body.salt).toBeUndefined();
        expect(body.admin).toBeUndefined();
        expect(body.hash).toBeUndefined();
      })
      .expect(401);
  });

  it('Should not return auth token', () => {
    return request(app)
      .post('/auth/login')
      .send({ name: 'tssd', password: '3213213213123' })
      .expect(({ body }) => {
        expect(body.password).toBeUndefined();
        expect(body.admin).toBeUndefined();
        expect(body.salt).toBeUndefined();
        expect(body.hash).toBeUndefined();
      })
      .expect(401);
  });
});

describe('Users', () => {
  it('Should not return user', () => {
    return request(app)
      .get('/users/profile')
      .expect(401);
  });

  it('Should return user', () => {
    return request(app)
      .get('/users/profile')
      .set('Authorization', 'bearer ' + user.token)
      .expect(({ body }) => {
        console.log(body);
        expect(body.id).toBeDefined();
        expect(body.name).toBeDefined();
        expect(body.password).toBeUndefined();
        expect(body.admin).toBeDefined();
        expect(body.salt).toBeUndefined();
        expect(body.hash).toBeUndefined();
      })
      .expect(200);
  });

  it('Should not return all users', () => {
    return request(app)
      .get('/users')
      .expect(401);
  });

  it('Should not return all users', () => {
    return request(app)
      .get('/users')
      .set('Authorization', 'bearer ' + user.token)
      .expect(401);
  });

  it('Should return all users', () => {
    return request(app)
      .get('/users')
      .set('Authorization', 'bearer ' + admin.token)
      .expect(200);
  });
});

describe('Bots', () => {
  describe('create', () => {
    it('Should return unauth', () => {
      return request(app)
        .post('/bots')
        .expect(401);
    });

    it('Should return unauth', () => {
      return request(app)
        .post('/bots')
        .set('Authorization', 'bearer ' + user.token)
        .expect(401);
    });

    it('Should create bot 1', () => {
      return request(app)
        .post('/bots')
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body[0].id).toBeDefined();
          bot1Id = body[0].id;
        })
        .expect(201);
    });

    it('Should create bot 2', () => {
      return request(app)
        .post('/bots')
        .set('Authorization', 'bearer ' + admin.token)
        .send({ name: 'Test bot', channel: 3, address: '127.0.0.1' })
        .expect(({ body }) => {
          expect(body[0].id).toBeDefined();
          bot2Id = body[0].id;
        })
        .expect(201);
    });
  });

  describe('fetch', () => {
    it('Should return unauth', () => {
      return request(app)
        .get('/bots')
        .expect(401);
    });

    it('Should return 0 bots', () => {
      return request(app)
        .get('/bots')
        .set('Authorization', 'bearer ' + user.token)
        .expect(({ body }) => {
          expect(body.length).toBe(0);
        })
        .expect(200);
    });

    it('Should return 404', () => {
      return request(app)
        .get('/bots/' + bot1Id)
        .set('Authorization', 'bearer ' + user.token)
        .expect(404);
    });

    it('Should return 2 bots', () => {
      return request(app)
        .get('/bots')
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body.length).toBe(2);
        })
        .expect(200);
    });

    it('Should return 1 bot', () => {
      return request(app)
        .get('/bots/' + bot1Id)
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body.id).toBe(bot1Id);
        })
        .expect(200);
    });

    it('Should return 2 bot', () => {
      return request(app)
        .get('/bots/' + bot2Id)
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body.id).toBe(bot2Id);
        })
        .expect(200);
    });
  });

  describe('owner change', () => {
    it('Should return unauth', () => {
      return request(app)
        .patch('/bots/' + bot2Id + '/owner')
        .expect(401);
    });

    it('Should return unauth', () => {
      return request(app)
        .patch('/bots/' + bot2Id + '/owner')
        .set('Authorization', 'bearer ' + user.token)
        .expect(401);
    });

    it('Should change owner', () => {
      return request(app)
        .patch('/bots/' + bot2Id + '/owner')
        .send({ id: user.id })
        .set('Authorization', 'bearer ' + admin.token)
        .expect(200);
    });

    it('Should returnbot', () => {
      return request(app)
        .get('/bots/' + bot2Id)
        .set('Authorization', 'bearer ' + user.token)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.id).toBe(bot2Id);
        })
        .expect(200);
    });
  });

  describe('bot edit', () => {
    it('Should return unauth', () => {
      return request(app)
        .patch('/bots/' + bot1Id)
        .expect(401);
    });

    it('Should return 404', () => {
      return request(app)
        .patch('/bots/' + bot1Id)
        .set('Authorization', 'bearer ' + user.token)
        .expect(404);
    });

    it('Should edit bot', () => {
      return request(app)
        .patch('/bots/' + bot1Id)
        .send({ language: 'pl', name: 'Edit', address: '127.0.0.1' })
        .set('Authorization', 'bearer ' + admin.token)
        .expect(200);
    });

    it('Should return edited bot', () => {
      return request(app)
        .get('/bots/' + bot1Id)
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.language).toBe('pl');
          expect(body.name).toBe('Edit');
          expect(body.address).toBe('127.0.0.1');
        })
        .expect(200);
    });
  });

  describe('bot stop', () => {
    it('Should return unauth', () => {
      return request(app)
        .get('/bots/' + bot1Id + '/stop')
        .expect(401);
    });

    it('Should return 404', () => {
      return request(app)
        .get('/bots/' + bot1Id + '/stop')
        .set('Authorization', 'bearer ' + user.token)
        .expect(404);
    });

    it('Should stop bot', () => {
      return request(app)
        .get('/bots/' + bot1Id + '/stop')
        .set('Authorization', 'bearer ' + admin.token)
        .expect(200);
    });

    it('Should return edited bot', () => {
      return request(app)
        .get('/bots/' + bot1Id)
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body.status).toBe(0);
        })
        .expect(200);
    });
  });

  describe('bot start', () => {
    it('Should return unauth', () => {
      return request(app)
        .get('/bots/' + bot1Id + '/start')
        .expect(401);
    });

    it('Should return 404', () => {
      return request(app)
        .get('/bots/' + bot1Id + '/start')
        .set('Authorization', 'bearer ' + user.token)
        .expect(404);
    });

    it('Should start bot', () => {
      return request(app)
        .get('/bots/' + bot1Id + '/start')
        .set('Authorization', 'bearer ' + admin.token)
        .expect(200);
    });

    it('Should return edited bot', () => {
      return request(app)
        .get('/bots/' + bot1Id)
        .set('Authorization', 'bearer ' + admin.token)
        .expect(({ body }) => {
          expect(body.status).toBe(1);
        })
        .expect(200);
    });
  });

  // it('Should return unauth', () => {
  //   return request(app)
  //     .get('/bots/' + bot1Id + '/rights')
  //     .expect(401);
  // });

  // it('Should return 0 bots', () => {
  //   return request(app)
  //     .get('/bots')
  //     .set('Authorization', 'bearer ' + user.token)
  //     .expect(({ body }) => {
  //       expect(body.length).toBe(0);
  //     })
  //     .expect(200);
  // });

  // it('Should return 404', () => {
  //   return request(app)
  //     .get('/bots/' + bot1Id)
  //     .set('Authorization', 'bearer ' + user.token)
  //     .expect(({ body }) => {
  //       console.log(body);
  //     })
  //     .expect(404);
  // });
});

afterAll(() => {
  mongoose.disconnect();
  console.log('ADMIN', admin);
  console.log('USER', user);
  console.log('BOT ID', bot1Id);
});
