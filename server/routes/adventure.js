import { Router } from 'express';
import { handleAdventureRequest } from './adventureHandler.js';

const router = Router();

router.post('/', async (req, res) => {
  const { status, body } = await handleAdventureRequest(req.body);
  res.status(status).json(body);
});

export default router;