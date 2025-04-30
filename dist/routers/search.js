"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const yt_search_1 = __importDefault(require("yt-search")); // yt-search 라이브러리 임포트
require('dotenv').config();
const router = express_1.default.Router();
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ error: '검색어가 필요합니다' });
    }
    try {
        // yt-search를 사용하여 유튜브 검색 결과 가져오기
        const result = yield (0, yt_search_1.default)(query);
        // 결과에서 필요한 정보 추출
        const videos = result.videos.map((video) => ({
            title: video.title,
            videoId: video.videoId,
            thumbnail: video.thumbnail
        }));
        res.json(videos); // 결과 반환
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: '검색 실패' });
    }
}));
exports.default = router;
