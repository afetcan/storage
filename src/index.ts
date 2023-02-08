import { EmergencyEntity, UserEntity } from './entity'
export type { UserEntity, EmergencyEntity }

export const entities = [UserEntity, EmergencyEntity]
export type { ResultInterface } from './types'
export { createStorage } from './repo'
export type { Shared, Storage } from './repo'
export { DatabaseSeeder } from './seeders/DatabaseSeeder'
export { createMikroORMPostgress } from './db/create'

const data = 'hello'

export { data }
