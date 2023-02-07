import { Entity, Property } from '@mikro-orm/core'
import { CustomBaseEntity } from '../base'

@Entity({ tableName: 'emergency', schema: 'public' })
export class EmergencyEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'point', length: 255, nullable: true })
  latitude?: number

  @Property({ type: 'string', columnType: 'point', length: 255, nullable: true })
  longitude?: number

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  address?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  name?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  surname?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  phone?: string

  constructor(attrs: Partial<EmergencyEntity> = {}) {
    super()
    Object.assign(this, attrs)
  }
}
