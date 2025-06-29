import React, { createContext, useContext, useState } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import api from '../services/api';

const GameContext = createContext(undefined);

export function GameProvider({ children }) {
    const [gameSession, setGameSession] = useState(null);
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [gamePhase, setGamePhase] = useState("lobby"); // Default to lobby
    const [leaderboard, setLeaderboard] = useState([]);
    const [answerResult, setAnswerResult] = useState(null);

    const { socket } = useSocket();
    const { user } = useAuth();

    /**
     * Creates the game session via an API call and immediately has the host join the socket room.
     * The backend creates the GameSession and the host as the first Player.
     * The frontend then uses the returned PIN to join the socket room, identifying itself as the host.
     */
    const createGameSessionAPI = (quizId) => {
        return new Promise(async (resolve, reject) => {
            if (!user || !socket) {
                const errorMessage = !user ? "User not logged in." : "Socket not connected.";
                return reject(new Error(errorMessage));
            }

            try {
                // Step 1: Create the game session via API. Backend creates the GameSession and a Player record for the host.
                const response = await api.post(`/games/${quizId}/start`);
                const { pin } = response.data;

                // Step 2: Immediately have this socket join the room as the identified host player.
                // --- THIS IS THE CRITICAL FIX ---
                // We send the nickname along with the PIN so the backend can find the
                // corresponding Player record and associate it with this socket connection.
                socket.emit('player_join_room', {
                    pin: pin,
                    nickname: user.name // Assumes user.name is the nickname used to create the player on the backend
                });
                // --- END OF FIX ---

                // Step 3: Update local state to reflect being in a game session.
                setGameSession({ pin });
                setGamePhase('lobby'); // The host is now in the lobby
                
                resolve(pin); // Resolve with the PIN so the UI can navigate to the lobby screen
            } catch (error) {
                const msg = error.response?.data?.message || "Failed to create game session.";
                reject(new Error(msg));
            }
        });
    };

    /**
     * Allows a non-host player to join an existing game using a PIN and nickname.
     */
    const joinGameSession = (pin, nickname, callback) => {
        if (!socket) {
            return callback({ success: false, message: "Connection error." });
        }

        socket.emit('player_join', { pin, nickname }, (response) => {
            if (response.success) {
                setGameSession({ pin }); 
                setGamePhase('lobby');
            }
            callback(response);
        });
    };

    /**
     * Emits the event for the host to start the game.
     */
    const startGame = () => {
        if (socket && gameSession?.pin) {
            socket.emit('start_game', { pin: gameSession.pin });
        }
    };

    /**
     * Handles answer submission to the backend.
     */
    const submitAnswer = (optionId) => {
        if (socket && gameSession?.pin && currentQuestion?.id) {
            const payload = {
                pin: gameSession.pin,
                questionId: currentQuestion.id,
                optionId
            };
            console.log('[FRONTEND-SEND] Submitting answer:', payload);
            socket.emit('submit_answer', payload);
        }
    };

    /**
     * Resets all game-related state. Called when leaving a lobby or finishing a game.
     */
    const leaveGame = () => {
        if (socket && gameSession?.pin) {
            socket.emit('leave_game', { pin: gameSession.pin });
        }
        console.log('Leaving game - resetting all local state');
        setGameSession(null);
        setPlayers([]);
        setCurrentQuestion(null);
        setGamePhase('lobby'); // Reset to default state
        setLeaderboard([]);
        setAnswerResult(null);
    };

    const value = {
        // State
        gameSession,
        players,
        currentQuestion,
        gamePhase,
        leaderboard,
        answerResult,

        // Setters (for direct state management from components)
        setGameSession,
        setPlayers,
        setCurrentQuestion,
        setGamePhase,
        setLeaderboard,
        setAnswerResult,

        // Actions
        createGameSessionAPI,
        joinGameSession,
        startGame,
        submitAnswer,
        leaveGame,

        // The following functions were removed as they were either redundant
        // or their logic is better handled directly within components (like handling socket events).
        // - updatePlayerScore (player list is updated authoritatively by the server)
        // - updatePlayersList (use setPlayers directly)
        // - handleNewQuestion (handled in GameBattleScreen)
        // - handleAnswerResult (handled in GameBattleScreen)
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
}