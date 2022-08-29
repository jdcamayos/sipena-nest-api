import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { diskStorage } from 'multer';
import * as fs from 'fs';

export const storage = diskStorage({
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
