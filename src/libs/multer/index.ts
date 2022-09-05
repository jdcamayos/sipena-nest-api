import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { diskStorage } from 'multer';
import * as fs from 'fs';

export const orderStorage = diskStorage({
  destination: async (req, file, done) => {
    const orderId = req.params.orderId;
    if (!orderId) {
      throw new Error('orderId missed');
    }
    const orderPath = path.resolve('uploads', orderId);
    if (!fs.existsSync(orderPath)) {
      await fs.promises.mkdir(orderPath);
    }
    done(null, path.join('uploads', orderId));
  },
  filename: (req, file, done) => {
    done(null, uuid() + path.extname(file.originalname));
  },
});

export const userStorage = diskStorage({
  destination: async (req, file, done) => {
    const userId = req.params.userId;
    if (!userId) {
      throw new Error('userId missed');
    }
    const userPath = path.resolve('public', userId);
    if (!fs.existsSync(userPath)) {
      await fs.promises.mkdir(userPath);
    }
    done(null, path.join('public', userId));
  },
  filename: (req, file, done) => {
    done(null, uuid() + path.extname(file.originalname));
  },
});
