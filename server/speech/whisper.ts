import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from '../auth/auth-service.js';
import { auditLog } from '../audit/audit-log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid audio format'));
  }
});

router.post('/transcribe', requireAuth, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    const filePath = req.file.path;

    if (process.env.OPENAI_API_KEY) {
      // Dynamic import — openai is optional
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const openaiModule = await (Function('return import("openai")')() as Promise<any>);
      const OpenAI = openaiModule.default || openaiModule;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const fileStream = fs.createReadStream(filePath);
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        response_format: 'json',
        prompt: 'This is a recording of someone speaking to PRIMORDEX, an AI companion.'
      });
      fs.unlinkSync(filePath);
      await auditLog({ actor: req.user!.userId, action: 'speech_transcription', input: { fileName: req.file.originalname }, output: { text: transcription.text.slice(0, 100) }, risk_score: 0 });
      return res.json({ text: transcription.text });
    }

    fs.unlinkSync(filePath);
    res.json({ text: '', message: 'Whisper API not configured. Use browser Web Speech API.', webSpeechRecommended: true });
  } catch (error: any) {
    console.error('Transcription error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message || 'Failed to transcribe audio' });
  }
});

router.get('/status', requireAuth, (req: Request, res: Response) => {
  res.json({
    whisperAvailable: !!process.env.OPENAI_API_KEY,
    webSpeechAvailable: true,
    recommended: process.env.OPENAI_API_KEY ? 'whisper' : 'webSpeech'
  });
});

export { router as speechRouter };
