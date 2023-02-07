import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import { CustomBaseEntity } from './base'
import { UserSettingEntity } from './user-setting.entity'

@Entity({ tableName: 'siteTheme', schema: 'public' })
export class SiteThemeEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'varchar', length: 50, nullable: false })
  name!: string

  @Property({ type: 'string', columnType: 'varchar', length: 50, nullable: false })
  code!: string

  @OneToMany(() => UserSettingEntity, d => d.siteTheme, { eager: true })
  userSettings = new Collection<UserSettingEntity>(this)

  constructor(attrs: Partial<SiteThemeEntity> = {}) {
    super()
    Object.assign(this, attrs)
  }
}
