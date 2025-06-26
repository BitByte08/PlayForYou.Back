import { Server, Socket } from 'socket.io';
import { RoomData } from '@/sockets/room/room.types';

export interface SocketServiceProps {
	connection: {
		socket: Socket;
		io: Server;
	};
	rooms: Record<string, RoomData>;
}