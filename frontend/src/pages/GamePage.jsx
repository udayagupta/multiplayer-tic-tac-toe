import React, { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../lib/socket';
import GameBoard from '../components/GameBoard';
import { Xmark, Omark } from '../components/Marks';
import GameOverModal from '../components/GameOverModal';

const EVENTS_NAMES = {
  GAME_START: "game_start",
  MAKE_MOVE: "make_move",
  GAME_UPDATE: "game_update",
  PLAYER_DISCONNECTED: "player_disconnected",
  REMATCH_INITIATED: "rematch_initiated",
}

const GamePage = () => {
  const location = useLocation();
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const isActiveGame = useRef(false);

  const { room: initialRoom } = location?.state || {};
  const [room, setRoom] = useState(initialRoom || null);
  const [status, setStatus] = useState(initialRoom ? "playing" : "waiting");
  const [mySymbol, setMySymbol] = useState(null);
  const isWaiting = (room?.rematchRequests?.[0] === socket.id) || (room?.rematchStatus === "declined");


  const handleCellClick = (cellIndex) => {
    console.log(cellIndex, "is clicked")
    socket.emit("make_move", { roomCode, cellIndex });
  };

  useEffect(() => {
    socket.on("game_start", (room) => {
      isActiveGame.current = true;
      setStatus("playing");
      setRoom(room);
      const me = room?.players.find(player => player.socketId === socket.id);
      setMySymbol(me.symbol);
    });

    socket.on("game_update", (updatedRoom) => {
      setRoom(updatedRoom);
      setStatus(updatedRoom.status);
    })

    socket.on("player_disconnected", ({ message, roomCode }) => {
      setStatus("disconnected");
    })
    
    // for player A - who initiated the rematch
    socket.on("rematch_initiated", (updatedRoom) => {
      setStatus(updatedRoom.status);
      setRoom(updatedRoom);
    })
    
    // for player B - who will either accept or decline
    socket.on("rematch_requested", (updatedRoom) => {
      if (room?.status === "rematch_requested") return;
      setRoom(updatedRoom);
      setStatus(updatedRoom.status);
    })

    // for player A - whose offer is declined
    socket.on("request_declined", (room) => {
      setRoom(room);
      setStatus("declined");
    })


    return () => {
      socket.off("game_start");
      socket.off("game_update");
      socket.off("player_disconnected");
      socket.off("rematch_initiated");
      socket.off("rematch_requested");
      socket.off("request_declined");
      
      if (isActiveGame.current) {
        socket.emit("leave_room", { roomCode });
      }

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
      <div className='lobby-content text-center w-full flex flex-col justify-center items-center'>
        <div className='bg-(--ink-soft) mb-5 mx-4 sm:m-auto border border-(--line) rounded-md flex gap-5 w-full sm:w-[300px] max-w-[300px] py-2 justify-center items-center'>
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


        {(status === "waiting" || status === "disconnected") ? (
          <div className='flex flex-col justify-between items-center pt-2'>
            {status === "waiting" && (
              <div className='flex flex-col gap-2 justify-between items-center'>
                <div className="w-8 h-8 rounded-full border-[3px] border-(--line) border-t-(--o-teal) animate-spin" />
                <p>Waiting for Opponent</p>
              </div>
            )}
            {status === "disconnected" && (
              <div className='text-2xl font-semibold'>
                <p>Opponent has disconnected</p>
                <a href="/" className='text-(--x-red) hover:underline'>Back to lobby</a>
              </div>
            )}
          </div>
        ) : <GameBoard 
              board={room.board}
              currentTurn={room.currentTurn}
              mySymbol={mySymbol}
              status={room.status}
              winner={room?.winner}
              onCellClick={handleCellClick}
              gameStatus={status}
            />}

          {(status === "won" || status === "draw" || status === "rematch_requested" || status === "declined") && (
            <GameOverModal 
              winner={room?.winner} 
              mySymbol={mySymbol} 
              status={status}
              room={room}
              isWaiting={isWaiting}
              gameStatus={status}
            />
            )}
      </div>
    </div>
  )
}

export default GamePage