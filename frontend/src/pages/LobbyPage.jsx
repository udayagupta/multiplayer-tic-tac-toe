import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { socket } from '../lib/socket';


const LobbyPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomCode === "") return;
  };

const handleCreate = () => {
  console.log("handleCreate fired");
  socket.off("room_created");
  socket.emit("create_room");
  console.log("create_room emitted");
  socket.on("room_created", ({ roomCode }) => {
    console.log("room_created received", roomCode);
    navigate(`/game/${roomCode}`);
  });
};

  socket.on("connect", () => console.log("connected", socket.id));
  socket.on("connect_error", (err) => console.log("connection error", err.message));

  return (
    <div className='lobby flex flex-col justify-center p-3 bg-[#12172B] items-center h-screen'>
      <div className='lobby-content w-full max-w-[480px]'>

        <div className="mark-row">
          <svg className="mark" viewBox="0 0 24 24" fill="none" stroke="var(--x-red)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 5L19 19M19 5L5 19" /></svg>
          <svg className="mark" viewBox="0 0 24 24" fill="none" stroke="var(--o-teal)" strokeWidth="2.5"><circle cx="12" cy="12" r="8" /></svg>
          <svg className="mark" viewBox="0 0 24 24" fill="none" stroke="var(--x-red)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 5L19 19M19 5L5 19" /></svg>
        </div>

        <div className='header text-center'>
          <h1 className='text-sm tracking-[0.28em] uppercase'>Multiplayer Lobby</h1>
          <p className='mt-1.5 text-4xl font-bold'>Start a match</p>
        </div>

        <div className='flex flex-col gap-5'>

          <button onClick={handleCreate} className='mt-10 create-room-btn text-center flex items-center justify-center gap-2'>Create Room</button>

          <div className=' flex flex-row items-center gap-3.5'>
            <div className="line flex-1"></div>
            <span className='text-xs tracking-widest text-'>OR</span>
            <div className="line flex-1"></div>
          </div>

          <div className='flex flex-col join-room'>
            <p className='text-left mb-2.5'>Have a room code ?</p>
            <div className='flex gap-2 items-center join-room-form'>
              <input
                placeholder="e.g. K7QX2P"
                autoComplete="off"
                type="text"
                name="roomCode"
                className='code-input rounded flex-1 border text-[15px] p-[14px_16px]'
                id="roomCode"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <button onClick={() => handleJoin()} className='join-btn flex items-center justify-center gap-2 p-[14px_20px] rounded border-[1.5px]'>Join</button>
            </div>
            <p className='text-[13px] mt-2 hint'>Ask the host for 6-digit room code</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LobbyPage