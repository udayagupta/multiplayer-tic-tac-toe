import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LobbyPage />}/>
        <Route path='/game/:roomCode' element={<GamePage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
