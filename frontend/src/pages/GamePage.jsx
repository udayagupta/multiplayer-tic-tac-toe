import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom';
import { socket } from '../lib/socket';
import GameBoard from '../components/GameBoard';
import { Xmark, Omark } from '../components/Marks';

const GamePage = () => {
  const location = useLocation();
  const { roomCode } = useParams();

  const { room: initialRoom } = location?.state || {};
  const [room, setRoom] = useState(initialRoom || null);
  const [status, setStatus] = useState(initialRoom ? "playing" : "waiting");
  const [mySymbol, setMySymbol] = useState(null);

  const handleCellClick = (cellIndex) => {
    console.log(cellIndex, "is clicked")
    socket.emit("make_move", { roomCode, cellIndex });
  };

  useEffect(() => {
    socket.on("game_start", (room) => {
      setStatus("playing");
      setRoom(room);
      const me = room.players.find(player => player.socketId === socket.id);
      setMySymbol(me.symbol);
    });

    socket.on("game_update", (updatedRoom) => {
      setRoom(updatedRoom);
      setStatus(updatedRoom.status);
    })

    socket.on("player_disconnected", ({ message, roomCode }) => {
      setStatus("disconnected");
    })


    return () => {
      socket.off("game_start");
      socket.off("game_update");
      socket.off("player_disconnected");
    }

  }, [roomCode]);

  useEffect(() => {
    if (initialRoom) {
      const me = room.players.find(player => player.socketId === socket.id);
      setMySymbol(me.symbol);
    }
  }, []);


  if (!roomCode) return (
    <div>No room code</div>
  )

  return (
    <div className='lobby flex  items-center h-screen'>
      <div className='lobby-content text-center w-full'>
        <div className='bg-(--ink-soft) mb-5 m-auto border  border-(--line) rounded-md  flex gap-5 w-[300px] py-2 justify-center items-center'>
          <div className='flex items-center justify-center gap-2 flex-1'>
            {mySymbol === 'X' ? <Xmark /> : <Omark />}
            <p>YOU</p>
          </div>
          <div className='w-[2px] h-[30px] bg-(--line)'></div>
          <div className='flex flex-col justify-between items-center flex-1'>
            <p>Room</p>
            <p className='tracking-widest font-semibold'>{roomCode}</p>
          </div>
        </div>

        {(!room && status === "waiting") ? (
          <div className='flex flex-col justify-between items-center'>
            <div className="w-8 h-8 rounded-full border-[3px] border-(--line) border-t-(--o-teal) animate-spin" />
            <p>Waiting for Opponent</p>
          </div>
        ) : <GameBoard board={room.board}
              currentTurn={room.currentTurn}
              mySymbol={mySymbol}
              status={room.status}
              winner={room?.winner}
              onCellClick={handleCellClick}
            />}

        
      </div>
    </div>
  )
}

export default GamePage