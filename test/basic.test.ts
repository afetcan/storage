import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import { MikroORM } from '@mikro-orm/postgresql'
import { type Storage, UserEntity, createStorage } from '@acildeprem/storage'
import { createMikroORMPostgress } from '@acildeprem/storage/createMikroORMPostgress'

let orm: MikroORM

let storage: Storage
const data = import.meta.env.VITE_TEST_DB_URL

beforeAll(async () => {
  orm = await createMikroORMPostgress({
    env: false,
    url: data,
    globalContext: true,
    db: 'postgres',
    dropShema: true,
    // debug: true,
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
    email: 'hello@acildeprem.com',
    fullName: 'acildeprem',
    createdAt: 'Tue Dec 20 2022 16:32:10 GMT+0300 (GMT+03:00)',
    updatedAt: 'Tue Dec 20 2022 16:32:10 GMT+0300 (GMT+03:00)',
    externalAuthUserId: '123',
    isAdmin: false,
    isSuperAdmin: false,
    superTokensUserId: '123',
    username: 'acildeprem',
  })
  await orm.em.persist(user).flush()

  orm.em.clear()

  const [u1] = await orm.em.find(UserEntity, user)
  expect(u1).toBeInstanceOf(UserEntity)

  u1.fullName = 'acildeprem'
  await orm.em.flush()

  orm.em.remove(u1)
  await orm.em.flush()

  const exists = await orm.em.count(UserEntity, {})
  expect(exists).toBe(0)
})
