import React, { useState, useEffect } from 'react';
import FinalScoreboard from '../components/FinalScoreboard';
import { clear } from 'console';

// Interfaz para el evento SCORE
interface ScoreEvent {
  trivia_id: string;
  type: 'score';
  scores: Record<string, number>;
}

// Interfaz para el evento STREAK
interface StreakEvent {
  trivia_id: string;
  type: 'streak';
  username: string;
  streak: number;
}

// Interfaz para el evento QUESTION
interface QuestionEvent {
  trivia_id: string;
  type: 'question';
  question_id: number;
  question_type: string;
  question_title: string;
  question_points: number;
  question_options?: Record<number, string>; // Opciones (solo para preguntas de tipo "button")
}

// Interfaz para el evento TIMER
interface TimerEvent {
  trivia_id: string;
  type: 'timer';
  question_id: number;
  seconds_remaining: number;
}

// Interfaz para el evento RESULT
interface ResultEvent {
  trivia_id: string;
  type: 'result';
  question_id: number;
  correct: boolean;
}

// Interfaz para el evento CHAT
interface ChatEvent {
  trivia_id: string;
  type: 'chat';
  question_id: number;
  message: string;
  username: string;
}

// Interfaz para el evento HIGHSCORE
interface HighscoreEvent {
  trivia_id: string;
  type: 'highscore';
  winners: Winner[];
}

// Interfaz Winner
interface Winner {
  username: string;
  score: number;
  streak: number;
}

interface GameProps {
  socket: WebSocket | null;
}

const Game: React.FC<GameProps> = ({ socket }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bestStreak, setBestStreak] = useState<StreakEvent | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionEvent | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatEvent[]>([]);
  const [showFinalScoreboard, setShowFinalScoreboard] = useState<boolean>(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [textAnswer, setTextAnswer] = useState<string>(''); // Estado para el valor de la respuesta de texto
  const [chatAnswer, setChatAnswer] = useState<string>(''); // Estado para el valor de la respuesta de chat
  const clearChat = () => {
    setChatMessages([]);
  };
  const [result, setResult] = useState<boolean>(false);

  const handleWebSocketMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
  
    switch (data.type) {
      case 'score':
        setScores(data.scores);
        break;
      case 'streak':
        setBestStreak(data);
        break;
      case 'question':
        setAnswered(false);
        setCurrentQuestion(data);
        clearChat();
        break;
      case 'timer':
        setSecondsRemaining(data.seconds_remaining);
        break;
      case 'result':
        setResult(data.correct);
        break;
      case 'chat':
        setChatMessages((messages) => [...messages, data]);
        console.log('Mensaje de chat recibido:', data);
        break;
      case 'highscore':
        console.log('Evento de highscore recibido:', data);
        setWinners(data.winners);
        localStorage.setItem('winners', JSON.stringify(data.winners));
        setShowFinalScoreboard(true);
        clearChat();
        break;
      default:
        // Handle other types of events if needed
        break;
    }
  };

  useEffect(() => {
    console.log('Socket en Game:', socket);

    if (socket) {
      socket.addEventListener('message', handleWebSocketMessage);
    }

    return () => {
      if (socket) {
        // ...
      }
    };
  }, [socket]);

  const handleAnswerButton = (optionId: string) => {
    if (socket && currentQuestion && !answered) {
      const answerEvent = {
        type: 'answer',
        question_id: currentQuestion.question_id,
        value: optionId
      };
      console.log('Enviando respuesta:', answerEvent);
      socket.send(JSON.stringify(answerEvent));

      setAnswered(true);
    }
  };

  const handleAnswerText = () => {
    if (socket && currentQuestion && !answered) {
      // Enviar la respuesta al servidor
      const answerEvent = {
        type: 'answer',
        question_id: currentQuestion.question_id,
        value: textAnswer, // Usar el valor del estado textAnswer
      };
      console.log('Enviando respuesta:', answerEvent);
      socket.send(JSON.stringify(answerEvent));
  
      setAnswered(true);
      setTextAnswer(''); // Limpiar el estado textAnswer
    }
  };

  const handleAnswerChat = () => {
    if (socket && currentQuestion && !answered) {
      const answerEvent = {
        type: 'answer',
        question_id: currentQuestion.question_id,
        value: chatAnswer,
      };
      console.log('Enviando respuesta:', answerEvent);
      socket.send(JSON.stringify(answerEvent));
      setChatAnswer(''); // Limpiar el estado chatAnswer
    }
  };

  return (
    <div>
      {/* Mostrar el id de la trivia en la que se encuentra el usuario sacándolo de la current question */}
      <h1>Trivia</h1>
      <p>Trivia ID: {currentQuestion?.trivia_id}</p>
  
      {showFinalScoreboard ? null : (
        <div>
          <h2>Puntuación</h2>
          <ul>
            {Object.entries(scores)
              .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Ordenar puntuaciones de mayor a menor
              .map(([username, score], index) => (
                <li key={username}>
                  {username}: {score}
                </li>
              ))}
          </ul>
    
          <h2>Mejor Racha</h2>
          {bestStreak && (
            <p>
              {bestStreak.username}: {bestStreak.streak}
            </p>
          )}
    
          {!showFinalScoreboard && currentQuestion && ( // Agregamos esta condición para mostrar el juego
            <div>
              <h2>Pregunta Numero {currentQuestion?.question_id}</h2>
              <p>{currentQuestion.question_title}</p>
              <p>Puntos: {currentQuestion.question_points}</p>
    
              {currentQuestion.question_type === 'button' && (
                <div>
                  <h3>Alternativas:</h3>
    
                  {Object.entries(currentQuestion.question_options || {}).map(([optionId, optionText]) => (
                    <button
                      key={optionId}
                      onClick={() => handleAnswerButton(optionId.toString())}
                      disabled={answered}
                    >
                      {optionText}
                    </button>
                  ))}
                </div>
              )}
    
              {currentQuestion.question_type === 'text' && (
                <div>
                  <h3>Texto:</h3>
                  {/* Agregar un input y un botón para enviar la respuesta */}
                  <input
                    type="text"
                    value={textAnswer} // El valor del input es controlado por el estado textAnswer
                    onChange={(e) => setTextAnswer(e.target.value)} // Actualiza el estado textAnswer cuando el usuario escribe
                  />
                  <button
                    onClick={() => handleAnswerText()}
                    disabled={answered} // Deshabilitar el botón si el usuario ya respondió
                  >
                    Enviar
                  </button>
                </div>
              )}
    
              {currentQuestion.question_type === 'chat' && (
                <div>
                  <h3>Chat:</h3>
                  <ul>
                    {chatMessages.map((message, index) => (
                      <li key={index}>
                        {message.username}: {message.message}
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    value={chatAnswer} // El valor del input es controlado por el estado chatAnswer
                    onChange={(e) => setChatAnswer(e.target.value)} // Actualiza el estado chatAnswer cuando el usuario escribe
                  />
                  <button onClick={() => handleAnswerChat()}>Enviar</button>
                </div>
              )}

              {/* Mostrar el resultado */}
              {answered && currentQuestion.question_type !== 'chat' && (
                <div>
                  <p>Respuesta: {result ? 'Correcta' : 'Incorrecta'}</p>
                </div>
              )}
    
              {secondsRemaining !== null && (
                <p>Tiempo restante: {secondsRemaining} segundos</p>
              )}
            </div>
          )}
        </div>
      )}

      {showFinalScoreboard ? (
        <FinalScoreboard socket={socket} winners={winners} />
      ) : null}
    </div>
  );
};

export default Game;
