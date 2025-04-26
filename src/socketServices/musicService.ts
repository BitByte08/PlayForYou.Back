import {MusicResponse, RoomState, SocketServiceProps} from "../interfaces";

export const addMusic = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('add_music', (response: MusicResponse) => {
        console.log(response);
        if(rooms[response.roomId].musicQueue === undefined) return;

        // 큐에 영상 추가
        rooms[response.roomId].musicQueue.push(response.musicInfo);
        if(rooms[response.roomId].state === null){
            const roomState:RoomState = {
                currentMusic: response.musicInfo,
                endCount: 0,
                startedAt: Date.now(),
            };
            rooms[response.roomId].state = {...roomState};
            io.to(response.roomId).emit('music_state', roomState);
        }
        io.to(response.roomId).emit('playlist', rooms[response.roomId].musicQueue);
    });
}
export const getMusic = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('get_music',(roomId: string)=>{
        io.to(roomId).emit('music_state', rooms[roomId].state);
        io.to(roomId).emit('playlist', rooms[roomId].musicQueue);
    });
}