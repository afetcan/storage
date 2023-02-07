import { EntityManager } from '@mikro-orm/postgresql'
import { Shared } from './types/shared'

export class GlobalRepo {
  constructor(private em: EntityManager,
    private shared: Shared) {
  }
}
