import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import { CustomBaseEntity } from '../base'
import { CityEntity } from './city.entity'

@Entity({ tableName: 'country', schema: 'public' })
export class CountryEntity extends CustomBaseEntity {
  @Property({ type: 'string', columnType: 'varchar', length: 255, nullable: false })
  name!: string

  @Property({ type: 'string', columnType: 'varchar', length: 200, nullable: true })
  currencyName?: string

  @Property({ type: 'string', columnType: 'varchar', length: 200, nullable: true })
  currencySymbol?: string

  @Property({ type: 'boolean', columnType: 'bool', default: true, nullable: false })
  isActive!: boolean

  @OneToMany(() => CityEntity, d => d.country, { eager: true })
  cities = new Collection<CityEntity>(this)

  constructor(attrs: Partial<CountryEntity> = {}) {
    super()
    Object.assign(this, attrs)
  }
}
