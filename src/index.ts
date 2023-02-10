import { EmergencyEntity, UserEntity } from './entity'
import { createMikroORMPostgress } from './db/create.js'

export { UserEntity, EmergencyEntity }
export type { ResultInterface } from './types'
export type { Shared, Storage } from './repo'

export { DatabaseSeeder } from './seeders/DatabaseSeeder'
export { createStorage } from './repo/index.js'
export { createMikroORMPostgress }

export const entities = [UserEntity, EmergencyEntity]
