import { Entity, OneToOne, Property } from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'
import { CustomBaseEntity } from './base'
import { UserSettingEntity } from './user-setting.entity'
@Entity({ tableName: 'user', schema: 'public' })
export class UserEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'varchar', length: 20, nullable: false })
  username!: string

  @Property({ type: 'string', columnType: 'varchar', length: 255 })
  email!: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  fullName?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  externalAuthUserId?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  superTokensUserId?: string

  @Property({ type: 'boolean', columnType: 'boolean', nullable: false, default: false })
  isAdmin!: boolean

  @Property({ type: 'boolean', columnType: 'boolean', nullable: false, default: false })
  isSuperAdmin!: boolean

  @OneToOne(() => UserSettingEntity, { nullable: true, fieldName: 'userSettingId', ref: true, orphanRemoval: true })
  userSetting?: Ref<UserSettingEntity>

  constructor(attrs: Partial<UserEntity> = {}) {
    super()
    Object.assign(this, attrs)
  }
}
