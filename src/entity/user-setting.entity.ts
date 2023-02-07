import { Entity, ManyToOne, OneToOne, Property } from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'
import { CustomBaseEntity } from './base'
import { UserEntity } from './user.entity'
import { SiteThemeEntity } from './site-theme.entity'
import { SiteLanguageEntity } from './site-language.entity'
@Entity({ tableName: 'userSetting', schema: 'public' })
export class UserSettingEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'varchar', length: 200, nullable: true })
  timezone?: string | null

  @OneToOne(() => UserEntity, { nullable: false, fieldName: 'userId', ref: true })
  user!: Ref<UserEntity>

  /**
 * @description Sitede /Uygulamada seçili tema
 */
  @ManyToOne(() => SiteThemeEntity, { eager: false, nullable: true, fieldName: 'siteThemeId', ref: true })
  siteTheme?: Ref<SiteThemeEntity>

  /**
 * @description Sitede /Uygulamada seçili dil
 */
  @ManyToOne(() => SiteLanguageEntity, { eager: false, nullable: true, fieldName: 'siteLanguageId', ref: true })
  siteLanguage?: Ref<SiteLanguageEntity>

  constructor(attrs: Partial<UserSettingEntity> = {}) {
    super()
    Object.assign(this, attrs)
  }
}
