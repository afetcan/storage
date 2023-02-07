import { wrap } from '@mikro-orm/core'
import { EntityManager } from '@mikro-orm/postgresql'
import { generateUsername } from 'unique-username-generator'
import { ResultInterface } from '../types'
import { UserSettingEntity } from '../entity/user-setting.entity'
import { UserEntity } from '../entity/user.entity'
import { slugifyUsername } from '../utils/username'
import { Shared } from './types/shared'
import { CreateUserSettingInput, UpdateUserSettingInput } from './types/user.type'

export interface esureUserExistsArgs {
  email: string
  externalAuthUserId?: string
  superTokensUserId?: string
}

export interface NewUserOnboardInput {
  username: string
  fullName?: string
}

export class UserRepo {
  constructor(private em: EntityManager, private shared: Shared) { }

  /**
   * Bu method, superTokensUserId'ye göre kullanıcıyı veritabanı kaydeder.
   * Eğer kullanıcı zaten varsa, kullanıcıyı döndürür.
   */
  async ensureUserExists(data: esureUserExistsArgs): Promise<UserEntity | null> {
    if (data.superTokensUserId) {
      const internalUser = await this.shared.getUserBySuperTokenId(data.superTokensUserId)

      if (!internalUser) {
        const user = this.em.create(UserEntity, {
          email: data.email,
          externalAuthUserId: data.externalAuthUserId,
          superTokensUserId: data.superTokensUserId,
          username: slugifyUsername(generateUsername('-', 2, 20)),
          isAdmin: false,
          isSuperAdmin: false,
        })

        await this.em.persistAndFlush(user)

        return user
      }
      else {
        return internalUser
      }
    }
    else {
      return null
    }
  }

  async updateUser(input: { username: string; fullName: string; id: string }): Promise<UserEntity> {
    const user = await this.em.findOne(UserEntity, { id: input.id })

    if (!user)
      throw new Error('User not found')

    wrap(user).assign({
      username: slugifyUsername(input.username),
      fullName: input.fullName,
      isAdmin: false,
    })
    await this.em.persistAndFlush(user)

    return user
  }

  async updateProfileImage(input: { id: string }) {
    const user = await this.em.findOneOrFail(UserEntity, { id: input.id })

    await this.em.persistAndFlush(user)
  }

  async getUserBySuperTokenId({ superTokensUserId }: { superTokensUserId: string }) {
    return await this.shared.getUserBySuperTokenId(superTokensUserId)
  }

  /**
 * Kullanıcı profil bilgileri güncelleme
 * @param id
 * @param input
 * @returns
 */
  async newUserOnboard(id: string, input: NewUserOnboardInput): Promise<UserEntity> {
    const user = await this.em.findOne(UserEntity, { id })
    if (!user)
      throw new Error('User not found')

    wrap(user).assign({
      username: slugifyUsername(input.username),
      fullName: input.fullName,
    })
    await this.em.persistAndFlush(user)

    return user
  }

  /**
 * @description Creates user setting
 * @param user
 * @param input
 * @returns user setting
 */
  async createUserSetting(user: UserEntity, input: CreateUserSettingInput): Promise<ResultInterface<UserSettingEntity>> {
    const result: ResultInterface<UserSettingEntity> = { isSuccess: false, message: '', data: undefined }
    try {
      const userSetting = await this.em.findOne(UserSettingEntity, { user })
      if (userSetting) {
        result.message = 'User setting already exists'
        return result
      }
      const data = this.em.create(UserSettingEntity, { user, ...input })

      await this.em.persistAndFlush(data)

      result.isSuccess = true
      result.message = 'Added user setting successfully'
      result.data = data
    }
    catch (err) {
      console.log(err)
      throw new Error('Something went wrong')
    }
    return result
  }

  /**
 * @description Updates user setting
 * @param user
 * @param input
 * @returns user setting
 */
  async updateUserSetting(user: UserEntity, input: UpdateUserSettingInput): Promise<ResultInterface<UserSettingEntity>> {
    const result: ResultInterface<UserSettingEntity> = { isSuccess: false, message: '', data: undefined }
    try {
      const userSetting = await this.em.findOne(UserSettingEntity, { user })
      if (!userSetting) {
        result.message = 'User setting not found'
        return result
      }
      wrap(userSetting).assign({
        timezone: input.timezone ? input.timezone : userSetting.timezone,
        siteTheme: input.siteThemeId ? input.siteThemeId : userSetting.siteTheme,
        siteLanguage: input.siteLanguageId ? input.siteLanguageId : userSetting.siteLanguage,
      })
      await this.em.persistAndFlush(userSetting)
      const updated = await this.em.findOne(UserSettingEntity, { user })
      if (updated) {
        result.data = updated
        result.isSuccess = true
        result.message = 'Updated user setting successfully'
      }
      else {
        result.message = 'Something went wrong'
      }
    }
    catch (err) {
      console.log(err)
      throw new Error('Something went wrong')
    }
    return result
  }
}
