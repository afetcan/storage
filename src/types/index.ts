export interface ResultInterface<Type> {
  isSuccess: boolean
  message: string
  data: Type | undefined
}
