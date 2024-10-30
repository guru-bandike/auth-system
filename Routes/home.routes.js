import express from 'express';
import auth from '../Middlewares/auth.middleware.js';

const homeRouter = express.Router();

homeRouter.get('/', auth, (req, res, next) => {
  res.render('home');
});

export default homeRouter;
