import { EmergencyRepo } from '../emergency'
import { UserRepo } from '../user'

export interface Storage {
  destroy(): Promise<void>
  userRepo: UserRepo
  debtRepo: EmergencyRepo
}
