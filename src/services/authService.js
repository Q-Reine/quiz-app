import AsyncStorage from "@react-native-async-storage/async-storage"

class AuthService {
  constructor() {
    this.users = [
      {
        id: 1,
        username: "TestUser",
        email: "test@example.com",
        password: "password",
        elo_rating: 1250,
        total_games: 15,
        wins: 9,
        losses: 6,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        username: "QuizMaster",
        email: "quiz@example.com",
        password: "password",
        elo_rating: 1800,
        total_games: 50,
        wins: 35,
        losses: 15,
        created_at: new Date().toISOString(),
      },
    ]
  }

  async login(email, password) {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = this.users.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return {
        success: true,
        token: "local_token_" + user.id,
        user: userWithoutPassword,
      }
    } else {
      return {
        success: false,
        message: "Invalid credentials",
      }
    }
  }

  async register(username, email, password) {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const existingUser = this.users.find((u) => u.email === email || u.username === username)
    if (existingUser) {
      return {
        success: false,
        message: "User already exists",
      }
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      elo_rating: 1200,
      total_games: 0,
      wins: 0,
      losses: 0,
      created_at: new Date().toISOString(),
    }

    this.users.push(newUser)

    const { password: _, ...userWithoutPassword } = newUser
    return {
      success: true,
      token: "local_token_" + newUser.id,
      user: userWithoutPassword,
    }
  }

  async getProfile(token) {
    if (!token || !token.startsWith("local_token_")) {
      return null
    }

    const userId = Number.parseInt(token.replace("local_token_", ""))
    const user = this.users.find((u) => u.id === userId)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }

    return null
  }

  async updateProfile(profileData) {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const token = await AsyncStorage.getItem("authToken")
    if (!token || !token.startsWith("local_token_")) {
      return { success: false, message: "Not authenticated" }
    }

    const userId = Number.parseInt(token.replace("local_token_", ""))
    const userIndex = this.users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...profileData,
      }

      const { password: _, ...userWithoutPassword } = this.users[userIndex]
      return {
        success: true,
        user: userWithoutPassword,
      }
    }

    return { success: false, message: "User not found" }
  }

  async googleAuth(userInfo) {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser = {
      id: Date.now(),
      username: userInfo.user.name.replace(/\s+/g, "").toLowerCase(),
      email: userInfo.user.email,
      elo_rating: 1200,
      total_games: 0,
      wins: 0,
      losses: 0,
      created_at: new Date().toISOString(),
    }

    this.users.push(newUser)

    return {
      success: true,
      token: "local_token_" + newUser.id,
      user: newUser,
    }
  }
}

export const authService = new AuthService()
