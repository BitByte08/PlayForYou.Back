"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endMusic = exports.getMusic = exports.addMusic = void 0;
exports.isEmbeddable = isEmbeddable;
function isEmbeddable(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        try {
            const res = yield fetch(url);
            return res.ok; // 404 or 401이면 임베드 불가능
        }
        catch (err) {
            return false;
        }
    });
}
const addMusic = (props) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('add_music', (request) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(request);
        const isValid = yield isEmbeddable(request.musicInfo.id);
        console.log(isValid);
        if (!isValid) {
            socket.emit('error_music', '이 영상은 퍼가기(임베드)가 제한되어 있습니다.');
            return;
        }
        // 큐에 영상 추가
        rooms[request.roomId].musicQueue.push(request.musicInfo);
        if (rooms[request.roomId].state === null) {
            console.log('set');
            const roomState = {
                currentMusic: request.musicInfo,
                endCount: 0,
                startedAt: Date.now(),
            };
            rooms[request.roomId].state = Object.assign({}, roomState);
            io.to(request.roomId).emit('music_state', roomState);
        }
        io.to(request.roomId).emit('playlist', rooms[request.roomId].musicQueue);
    }));
};
exports.addMusic = addMusic;
const getMusic = (props) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('get_music', (roomId) => {
        io.to(socket.id).emit('music_state', rooms[roomId].state);
        io.to(socket.id).emit('playlist', rooms[roomId].musicQueue);
    });
};
exports.getMusic = getMusic;
const endMusic = (props) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('end_music', (roomId) => {
        if (rooms[roomId].users.has(socket.id)) {
            if (rooms[roomId].state !== null) {
                console.log('end', socket.id, rooms[roomId].users.size);
                rooms[roomId].state.endCount += 1;
                if (rooms[roomId].state.endCount >= rooms[roomId].users.size) {
                    rooms[roomId].musicQueue = rooms[roomId].musicQueue.filter((_, index) => index !== 0);
                    if (rooms[roomId].musicQueue.length > 0) {
                        const nextRoomState = {
                            currentMusic: rooms[roomId].musicQueue[0],
                            endCount: 0,
                            startedAt: Date.now(),
                        };
                        rooms[roomId].state = Object.assign({}, nextRoomState);
                    }
                    else {
                        rooms[roomId].state = null;
                    }
                }
            }
            io.to(roomId).emit('music_state', rooms[roomId].state);
            io.to(roomId).emit('playlist', rooms[roomId].musicQueue);
        }
    });
};
exports.endMusic = endMusic;
