declare module '#auth-utils' {
  interface User {
    id?: string
    githubId: number
    githubUsername: string
    githubAvatarUrl: string
    email: string
  }
}

export {}
