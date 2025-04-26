import express from 'express';
import searchRouter from './routers/search';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {createRoom, deleteRoom, getRoom, joinRoom, leaveRoom} from "./socketServices/roomService";
import {RoomData, SocketServiceProps} from "./interfaces";
import {addMusic, getMusic} from "./socketServices/musicService";


const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
// 서버 전역에 방 별 큐 저장

const rooms: Record<string, RoomData> = {};

app.use(cors());
app.use('/', searchRouter);

io.on('connection', (socket) => {
    console.log(`✅ ${socket.id} connected`);
    const roomProps:SocketServiceProps = {
        connection: {
            io: io,
            socket: socket
        },
        rooms: rooms
    }
    deleteRoom(roomProps);
    // 방 목록 요청 처리
    getRoom(roomProps);
    // 방 생성 요청 처리
    createRoom(roomProps);
    // 방 참여 요청 처리
    joinRoom(roomProps);
    // 방 나가기 처리
    leaveRoom(roomProps);
    // 음악 추가 요청 처리
    addMusic(roomProps);

    getMusic(roomProps);
    // socket.on('get_playSing', (roomId: string) => {
    //     if (roomQueues[roomId].length >= 1) {
    //         if(roomPlaybackMap[roomId]==undefined) {
    //             const playbackState: PlaybackState = {
    //                 videoId: roomQueues[roomId][0].id,
    //                 startedAt: Date.now(),
    //                 isPlaying: true,
    //             };
    //             roomPlaybackMap[roomId] = playbackState;
    //         }
    //         io.to(roomId).emit('playback_state', roomPlaybackMap[roomId]);
    //         console.log(`🎵 재생 시작: ${roomQueues[roomId][0].id} in room ${roomId}`);
    //     }
    // })
    // // 음악이 끝났다고 클라이언트가 알려줌
    // socket.on('music-ended', (roomId: string) => {
    //
    //     const state = roomStates[roomId];
    //     console.log(state);
    //     if (!state) return;
    //
    //     state.endCount++;
    //
    //     // 모든 유저가 끝났을 경우
    //     if (state.endCount >= state.users.size) {
    //         const queue = roomQueues[roomId];
    //         if (queue && queue.length > 0) {
    //             queue.shift(); // 첫 곡 제거
    //             state.endCount = 0;
    //             const nextMusic = queue[0];
    //             if (nextMusic) {
    //                 state.currentMusicId = nextMusic.id;
    //                 state.startedAt = Date.now();
    //                 io.to(roomId).emit('play-music', nextMusic);
    //                 io.to(roomId).emit('queue-updated', queue);
    //             } else {
    //                 io.to(roomId).emit('queue-empty');
    //             }
    //         }
    //     }
    // });
    // 연결 해제
    socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} disconnected`);
    });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});