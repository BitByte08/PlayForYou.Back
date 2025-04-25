type InfoType = {
    roomId: string,
    musicInfo: musicType
};

type musicType = {
    name: string,
    id: string
};

type RoomState = {
    currentMusicId: string;
    startedAt: number;
    endCount: number;
    users: Set<string>; // socket.id 모음
}

type PlaybackState = {
    videoId: string;
    startedAt: number; // Date.now() 기준
    isPlaying: boolean;
}