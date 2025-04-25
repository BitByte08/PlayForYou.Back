type InfoType = {
    roomId: string,
    musicInfo: musicType
};

type musicType = {
    name: string,
    id: string
};

interface PlaybackState {
    videoId: string;
    startedAt: number; // Date.now() 기준
    isPlaying: boolean;
}