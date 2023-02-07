import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core'
import type { Ref } from '@mikro-orm/core'
import { CustomBaseEntity } from '../base'
import { CountryEntity } from './country.entity'
import { CurrentAddressEntity } from './current-address.entity'

@Entity({ tableName: 'city', schema: 'public' })
export class CityEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: false })
  name!: string

  @ManyToOne(() => CountryEntity, { eager: false, nullable: false, fieldName: 'countryId', ref: true })
  country?: Ref<CountryEntity>

  @OneToMany(() => CurrentAddressEntity, d => d.city, { eager: true })
  cities = new Collection<CurrentAddressEntity>(this)

  constructor(attrs: Partial<CityEntity> = {}) {
    super()
    Object.assign(this, attrs)
  }
}
