import { SocketServiceProps } from '@/interfaces/socket';

export const handleUserConnection = ({ connection }: SocketServiceProps) => {
	const { socket } = connection;

	// 연결될 때 유저 ID를 설정하고 싶다면 여기에 구현
	socket.on('register_user', (userId: string) => {
		socket.data.userId = userId;
		console.log(`\u{1F464} Registered user ${userId} on socket ${socket.id}`);
	});

	socket.on('disconnect', () => {
		console.log(`\u{274C} Socket disconnected: ${socket.id}`);
	});
};