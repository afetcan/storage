import slugify from 'slugify'

export const slugifyUsername = (username: string) => {
  const min = 2
  const max = 20
  const check = username.length >= min && username.length <= max
  if (check) {
    return slugify(username, {
      lower: true,
      replacement: '',
      remove: /[*+~.()'"!:@]/g,
    })
  }
  else {
    // TODO: i18n ekle
    throw new Error(
      `Username must be between ${min} and ${max} characters`,
    )
  }
}
