import { Seeder } from '@mikro-orm/seeder'
import type { EntityManager } from '@mikro-orm/postgresql'
// import { faker } from '@faker-js/faker'
import consola from 'consola'

async function someFunction(_em: EntityManager) {
  return []
}

export class DefaultSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // if default tenant exists, don't run

    consola.info('Seeding database...')
    const aa = await someFunction(em)
    em.persist(aa)

    await em.flush()
    consola.success('Database seeded')
  }
}
