class GameService {
  constructor() {
    this.categories = [
      { id: 1, name: "General Knowledge", description: "Mixed trivia questions", icon: "🧠" },
      { id: 2, name: "Science", description: "Physics, Chemistry, Biology", icon: "🔬" },
      { id: 3, name: "History", description: "World history and events", icon: "📚" },
      { id: 4, name: "Sports", description: "Sports and athletics", icon: "⚽" },
      { id: 5, name: "Entertainment", description: "Movies, TV, Music", icon: "🎬" },
      { id: 6, name: "Geography", description: "Countries, capitals, landmarks", icon: "🌍" },
    ]

    this.leaderboard = [
      { id: 1, username: "QuizMaster", elo_rating: 1800, total_games: 50, wins: 35, losses: 15, win_rate: 70 },
      { id: 2, username: "BrainBox", elo_rating: 1650, total_games: 40, wins: 28, losses: 12, win_rate: 70 },
      { id: 3, username: "TriviaKing", elo_rating: 1500, total_games: 30, wins: 20, losses: 10, win_rate: 67 },
      { id: 4, username: "SmartCookie", elo_rating: 1400, total_games: 25, wins: 15, losses: 10, win_rate: 60 },
      { id: 5, username: "TestUser", elo_rating: 1250, total_games: 15, wins: 9, losses: 6, win_rate: 60 },
    ]

    this.rooms = []
    this.questions = [
      {
        id: 1,
        question: "What is the capital of Australia?",
        correct_answer: "Canberra",
        incorrect_answers: ["Sydney", "Melbourne", "Perth"],
        category_id: 6,
        difficulty: "medium",
      },
      {
        id: 2,
        question: "What is the chemical symbol for gold?",
        correct_answer: "Au",
        incorrect_answers: ["Go", "Gd", "Ag"],
        category_id: 2,
        difficulty: "medium",
      },
      {
        id: 3,
        question: "In which year did World War II end?",
        correct_answer: "1945",
        incorrect_answers: ["1944", "1946", "1943"],
        category_id: 3,
        difficulty: "medium",
      },
      {
        id: 4,
        question: "How many players are on a basketball team on the court at one time?",
        correct_answer: "5",
        incorrect_answers: ["6", "7", "4"],
        category_id: 4,
        difficulty: "easy",
      },
      {
        id: 5,
        question: "Who directed the movie 'Jaws'?",
        correct_answer: "Steven Spielberg",
        incorrect_answers: ["George Lucas", "Martin Scorsese", "Francis Ford Coppola"],
        category_id: 5,
        difficulty: "medium",
      },
    ]

    this.achievements = [
      { id: 1, title: "First Win", description: "Win your first game", icon: "emoji-events", unlocked: true },
      {
        id: 2,
        title: "Speed Demon",
        description: "Answer 10 questions in under 5 seconds each",
        icon: "flash-on",
        unlocked: true,
      },
      { id: 3, title: "Perfect Game", description: "Get all 10 questions correct", icon: "star", unlocked: false },
      { id: 4, title: "Streak Master", description: "Win 5 games in a row", icon: "trending-up", unlocked: false },
    ]

    this.recentGames = [
      { id: 1, opponent: "QuizMaster99", result: "win", score: "8-6", category: "Science", date: "2 hours ago" },
      { id: 2, opponent: "BrainBox42", result: "loss", score: "5-7", category: "History", date: "1 day ago" },
      { id: 3, opponent: "TriviaKing", result: "win", score: "9-4", category: "Sports", date: "2 days ago" },
    ]
  }

  async createRoom(categoryId, difficulty) {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const room = {
      id: Date.now(),
      room_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      player1_id: 1, 
      player2_id: null,
      status: "waiting",
      current_question: 0,
      player1_score: 0,
      player2_score: 0,
      category_id: categoryId,
      difficulty: difficulty,
      created_at: new Date().toISOString(),
    }

    this.rooms.push(room)

    return {
      success: true,
      room: room,
    }
  }

  async joinRoom(roomCode) {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const room = this.rooms.find((r) => r.room_code === roomCode && r.status === "waiting")

    if (!room) {
      return {
        success: false,
        message: "Room not found or already started",
      }
    }

    
    room.player2_id = 2
    room.status = "in_progress"

    return {
      success: true,
      room: room,
      opponent: {
        id: 2,
        username: "OpponentUser",
        elo_rating: 1300,
      },
    }
  }

  async submitAnswer({ roomId, questionId, answer, timeTaken }) {
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    const question = this.questions.find((q) => q.id === questionId)
    const isCorrect = question ? question.correct_answer === answer : false

    return {
      success: true,
      isCorrect: isCorrect,
    }
  }

  async getCategories() {
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      categories: this.categories,
    }
  }

  async getLeaderboard() {
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      leaderboard: this.leaderboard,
    }
  }

  async getUserStats() {
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      stats: {
        accuracy: 78,
        averageTime: 8.5,
        favoriteCategory: "Science",
        longestStreak: 5,
      },
    }
  }

  async getUserAchievements() {
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      achievements: this.achievements,
    }
  }

  async getRecentGames() {
    
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      games: this.recentGames,
    }
  }

  getQuestionsByCategory(categoryId, difficulty, count = 10) {
    const categoryQuestions = this.questions.filter((q) => q.category_id === categoryId && q.difficulty === difficulty)

    if (categoryQuestions.length < count) {
      const allQuestions = this.questions.filter((q) => q.difficulty === difficulty)
      return allQuestions.slice(0, count)
    }

    return categoryQuestions.slice(0, count)
  }
}

export const gameService = new GameService()
