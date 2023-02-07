import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'
import { CustomBaseEntity } from '../base'
import { CityEntity } from './city.entity'

@Entity({ tableName: 'currentAddress', schema: 'public' })
export class CurrentAddressEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'varchar', length: 500, nullable: false })
  addressLineOne?: string

  @Property({ type: 'string', columnType: 'varchar', length: 500, nullable: true })
  addressLineTwo?: string

  @Property({ type: 'string', columnType: 'varchar', length: 10, nullable: true })
  postalCode?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  longitude?: string

  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: true })
  latitude?: string

  @ManyToOne(() => CityEntity, { eager: false, nullable: false, fieldName: 'cityId', ref: true })
  city?: Ref<CityEntity>
}
