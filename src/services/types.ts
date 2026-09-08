export type Session = {
  userId: string
}

export type AuthService = {
  subscribe: (listener: (session: Session | null) => void) => () => void
  requestOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, token: string) => Promise<void>
  signOut: () => Promise<void>
}

export type ParentProfile = {
  userId: string
  parentName: string
  children: string[]
}

export type ProfileService = {
  getCurrent: (userId: string) => Promise<ParentProfile>
}

export type AppServices = {
  auth: AuthService
  profiles: ProfileService
}
