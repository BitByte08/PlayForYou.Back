// routes/search.ts
import express, { Request, Response, Application } from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req: Request , res: Response ): Promise<any> => {
    const query = req.query.q as string;

    if (!query) return res.status(400).json({ error: '검색어가 필요합니다' });

    try {
        const response = await axios.get(
            'https://www.googleapis.com/youtube/v3/search',
            {
                params: {
                    part: 'snippet',
                    maxResults: 5,
                    q: query,
                    type: 'video',
                    key: process.env.YOUTUBE_API_KEY,
                },
            }
        );
        res.json(response.data.items);
    } catch (err) {
        res.status(500).json({ error: '검색 실패', detail: err });
    }
});

export default router;