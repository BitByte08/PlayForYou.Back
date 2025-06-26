import { SocketServiceProps } from '@/interfaces/socket';
import { handleCreateRoom, handleJoinRoom, handleLeaveRoom, handleDeleteRoom, handleGetRooms } from './room/room.handler';
import { handleUserConnection } from './user/user.handler';
import { handleAddMusic, handleEndMusic, handleGetMusic } from './music/music.handler';

export const registerSocketHandlers = (props: SocketServiceProps) => {
	// User 관련 이벤트
	handleUserConnection(props);

	// Room 관련 이벤트
	handleCreateRoom(props);
	handleJoinRoom(props);
	handleLeaveRoom(props);
	handleDeleteRoom(props);
	handleGetRooms(props);

	// Music 관련 이벤트
	handleAddMusic(props);
	handleEndMusic(props);
	handleGetMusic(props);
};