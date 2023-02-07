import { UserEntity } from '../../entity/user.entity'

export interface Shared {
  getUserBySuperTokenId: (id: string) => Promise<UserEntity | null>
}
