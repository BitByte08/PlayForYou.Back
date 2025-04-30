import express from 'express';
import searchRouter from './routers/search';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {createRoom, deleteRoom, getRoom, joinRoom, leaveRoom} from "./socketServices/roomService";
import {RoomData, SocketServiceProps} from "./interfaces";
import {addMusic, endMusic, getMusic} from "./socketServices/musicService";
import dotenv from 'dotenv';
import * as process from "node:process";
import bodyParser from "body-parser";
dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: `http://${process.env.FRONT}:3000`,
        methods: ['GET', 'POST']
    }
});
// 서버 전역에 방 별 큐 저장

const rooms: Record<string, RoomData> = {};

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
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
    // 음악 상태 요청 처리
    getMusic(roomProps);
    // 음악 종료 요청 처리
    endMusic(roomProps);

    socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} disconnected`);
    });
});

const PORT = 3002;
httpServer.listen(PORT,'0.0.0.0', () => {
    console.log(process.env.BACKEND);
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
