import { EntityManager } from '@mikro-orm/postgresql'
import { ResultInterface } from '../types'
import { EmergencyEntity, UserEntity } from '../entity'

import { CreateGPS } from './types/gps.type'
import { Shared } from './types/shared'

export class EmergencyRepo {
  constructor(private em: EntityManager, private shared: Shared) {
  }

  async createEmergency(input: CreateGPS, _user?: UserEntity): Promise<ResultInterface<EmergencyEntity>> {
    const result: ResultInterface<EmergencyEntity> = { isSuccess: false, message: '', data: undefined }
    try {
      const data = this.em.create(EmergencyEntity, { ...input })

      await this.em.persistAndFlush(data)

      result.isSuccess = true
      result.message = 'Added emergency successfully'
      result.data = data
    }
    catch (err) {
      console.log(err)
      throw new Error('Something went wrong')
    }
    return result
  }
}
