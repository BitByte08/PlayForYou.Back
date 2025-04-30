"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const search_1 = __importDefault(require("./routers/search"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const roomService_1 = require("./socketServices/roomService");
const musicService_1 = require("./socketServices/musicService");
const dotenv_1 = __importDefault(require("dotenv"));
const process = __importStar(require("node:process"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: `http://${process.env.FRONT}:3000`,
        methods: ['GET', 'POST']
    }
});
// 서버 전역에 방 별 큐 저장
const rooms = {};
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use('/', search_1.default);
io.on('connection', (socket) => {
    console.log(`✅ ${socket.id} connected`);
    const roomProps = {
        connection: {
            io: io,
            socket: socket
        },
        rooms: rooms
    };
    (0, roomService_1.deleteRoom)(roomProps);
    // 방 목록 요청 처리
    (0, roomService_1.getRoom)(roomProps);
    // 방 생성 요청 처리
    (0, roomService_1.createRoom)(roomProps);
    // 방 참여 요청 처리
    (0, roomService_1.joinRoom)(roomProps);
    // 방 나가기 처리
    (0, roomService_1.leaveRoom)(roomProps);
    // 음악 추가 요청 처리
    (0, musicService_1.addMusic)(roomProps);
    // 음악 상태 요청 처리
    (0, musicService_1.getMusic)(roomProps);
    // 음악 종료 요청 처리
    (0, musicService_1.endMusic)(roomProps);
    socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} disconnected`);
    });
});
const PORT = 3002;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(process.env.BACKEND);
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
