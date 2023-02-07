import { MikroORM } from '@mikro-orm/postgresql'
import { UserEntity } from '../entity/user.entity'
import { UserRepo } from './user'
import type { Shared } from './types/shared'
import type { Storage } from './types/type'
import { EmergencyRepo } from './emergency'
export type { Storage, Shared }

export async function createStorage(orm: MikroORM): Promise<Storage> {
  const em = orm.em.fork()
  const shared: Shared = {
    async getUserBySuperTokenId(id: string) {
      const user = await em.findOne(UserEntity, { superTokensUserId: id })
      return user
    },
  }

  const userRepo = new UserRepo(em, shared)
  const debtRepo = new EmergencyRepo(em, shared)

  const stroge: Storage = {
    destroy: async () => {
      await orm.close()
    },
    userRepo,
    debtRepo,
  }

  return stroge
}
