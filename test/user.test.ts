import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { MikroORM } from '@mikro-orm/postgresql'
import { type Storage, UserEntity, createStorage } from '@afetcan/storage'
import { NewUserOnboardInput } from 'src/repo/user'
import { createMikroORMPostgress } from '@afetcan/storage/createMikroORMPostgress'

let orm: MikroORM
let storage: Storage
const data = import.meta.env.VITE_TEST_DB_URL

beforeAll(async () => {
  console.log(data)
  orm = await createMikroORMPostgress({
    env: false,
    url: data,
    globalContext: true,
    db: 'postgres',
    dropShema: true,
    debug: true,
    synchronize: true,
    seeds: false,
  })
  storage = await createStorage(orm)
  // await orm.schema.refreshDatabase()
})

afterAll(async () => {
  await orm.schema.dropSchema({ schema: 'public' })
  await orm.close()
})

beforeEach(async () => {
  await orm.schema.clearDatabase({ schema: 'public' })
})

test('user CRUD test', async () => {
  const user = orm.em.create(UserEntity, {
    email: 'hello@afetcan.com',
    fullName: 'afetcan',
    createdAt: 'Tue Dec 20 2022 16:32:10 GMT+0300 (GMT+03:00)',
    updatedAt: 'Tue Dec 20 2022 16:32:10 GMT+0300 (GMT+03:00)',
    externalAuthUserId: '123',
    isAdmin: false,
    isSuperAdmin: false,
    superTokensUserId: '123',
    username: 'afetcan',
  })
  await orm.em.persist(user).flush()

  orm.em.clear()

  const [u1] = await orm.em.find(UserEntity, user)
  expect(u1).toBeInstanceOf(UserEntity)

  u1.fullName = 'afetcan'
  await orm.em.flush()

  orm.em.remove(u1)
  await orm.em.flush()

  const exists = await orm.em.count(UserEntity, {})
  expect(exists).toBe(0)
})

test('newUserOnboard', async () => {
  const user = orm.em.create(UserEntity, {
    id: 'f9648203-f2a0-44ce-9c97-620a33221485',
    email: 'hello@afetcan.com',
    createdAt: 'Tue Dec 20 2022 16:32:10 GMT+0300 (GMT+03:00)',
    updatedAt: 'Tue Dec 20 2022 16:32:10 GMT+0300 (GMT+03:00)',
    externalAuthUserId: '123',
    isAdmin: false,
    isSuperAdmin: false,
    superTokensUserId: '123',
    username: 'afetcan',
  })

  await orm.em.persist(user).flush()

  orm.em.clear()

  const [u1] = await orm.em.find(UserEntity, user)
  expect(u1).toBeInstanceOf(UserEntity)

  const data: NewUserOnboardInput = {
    fullName: 'yeni',
    username: 'eski',
  }

  await storage.userRepo.newUserOnboard(u1.id, data)

  orm.em.clear()

  const [u2] = await orm.em.find(UserEntity, user)

  expect(u2.fullName).toBe(data.fullName)
  expect(u2.username).toBe(data.username)

  await orm.em.persist(user).flush()

  orm.em.remove(u2)
  await orm.em.flush()

  const exists = await orm.em.count(UserEntity, {})
  expect(exists).toBe(0)
})
