import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// JSON 본문 파싱 미들웨어 추가

router.post('/signin', async (req, res) => {
  console.log(req.body);  // body 값 확인
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력하세요.' });
  }

  try {
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // Supabase의 auth.user 테이블 대신 직접 테이블 만들고 관리한다고 가정 (예: users 테이블)
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: '회원가입 실패' });
    }

    res.status(201).json({ message: '회원가입 성공', user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

export default router;