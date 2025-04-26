import express from 'express';
import ytSearch from 'yt-search';  // yt-search 라이브러리 임포트
require('dotenv').config();

const router = express.Router();

router.get('/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).json({ error: '검색어가 필요합니다' });
    }

    try {
        // yt-search를 사용하여 유튜브 검색 결과 가져오기
        const result = await ytSearch(query);

        // 결과에서 필요한 정보 추출
        const videos = result.videos.map((video: any) => ({
            title: video.title,
            videoId: video.videoId,
            thumbnail: video.thumbnail
        }));

        res.json(videos);  // 결과 반환
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: '검색 실패' });
    }
});

export default router;
