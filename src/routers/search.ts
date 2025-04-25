// backend/search.ts (Express)
import express from 'express';
import axios from 'axios';
import * as https from "node:https";
require('dotenv').config();
const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const agent = new https.Agent({
    rejectUnauthorized: false, // 인증서 검증 무시
});

router.get('/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
        res.status(400).json({ error: '검색어가 필요합니다' });
    }
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            httpsAgent: agent,
            params: {
                key: YOUTUBE_API_KEY,
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 5,
            },
        });
        const results = response.data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
        }));

        res.json(results);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: '검색 실패' });
    }
});

export default router;