import React from 'react'
import { useParams } from 'react-router-dom'

const GamePage = () => {
    const { roomCode } = useParams();

  return (
    <div>{roomCode}</div>
  )
}

export default GamePage