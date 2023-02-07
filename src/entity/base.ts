import { PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'

export class CustomBaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()', columnType: 'uuid' })
  id: string = uuid()

  @Property({ onCreate: () => new Date(), nullable: true, type: 'date', columnType: 'timestamptz' })
  createdAt?: Date

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date(), nullable: true, type: 'date', columnType: 'timestamptz' })
  updatedAt?: Date
}
