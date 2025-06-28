import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import searchRouter from './routers/search';
import { initializeSocketServer } from './sockets';
import { registerSocketHandlers } from './sockets/register';
import { RoomData } from './sockets/room/room.types';
import * as process from 'node:process';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: 'https://play4you.bitworkspace.kr',
		methods: ['GET', 'POST'],
	},
});

// 서버 전역에 방 별 큐 저장
const rooms: Record<string, RoomData> = {};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', searchRouter);

// 소켓 연결 시 모든 이벤트 등록
io.on('connection', (socket) => {
	console.log(`✅ ${socket.id} connected`);
	socket.data.username = "guest";
	registerSocketHandlers({
		connection: {socket, io},
		rooms,
	});
});

const PORT = 3002;
httpServer.listen(PORT, '0.0.0.0', () => {
	console.log(process.env.BACKEND);
	console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
