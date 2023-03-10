import { EmergencyEntity, UserEntity } from './entity'

export { UserEntity, EmergencyEntity }
export type { ResultInterface } from './types'
export type { Shared, Storage } from './repo'

export { DatabaseSeeder } from './seeders/DatabaseSeeder'
export { createStorage } from './repo/index.js'

export const entities = [UserEntity, EmergencyEntity]
