import {Server, Socket} from "socket.io";

export interface SocketServiceProps {
    connection: {
        socket: Socket;
        io: Server;
    };
    rooms: Record<string, RoomData>;
}
interface MusicData {
    name: string,
    id: string
};
export interface RoomState {
    currentMusic: MusicData;
    startedAt: number;
    endCount: number;
};
export interface RoomData {
    users: Set<string>,
    musicQueue: MusicData[]
    state: RoomState | null
};
export interface MusicResponse {
    roomId: string;
    musicInfo: MusicData
}