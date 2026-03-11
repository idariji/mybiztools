import { Request, Response } from 'express';
import { SmsService } from '../services/smsService.js';

export class SmsController {
  /** POST /api/sms/send */
  static async sendSms(req: Request, res: Response): Promise<void> {
    const { to, message, channel } = req.body;
    const result = await SmsService.sendSms({ to, message, channel });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/sms/bulk-send */
  static async sendBulkSms(req: Request, res: Response): Promise<void> {
    const { to, message, channel } = req.body;
    const result = await SmsService.sendBulkSms({ to, message, channel });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/sms/balance */
  static async getBalance(_req: Request, res: Response): Promise<void> {
    const result = await SmsService.getBalance();
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/sms/validate */
  static async validatePhone(req: Request, res: Response): Promise<void> {
    const result = await SmsService.validatePhone(req.body.phoneNumber);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/sms/history */
  static async getHistory(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const result = await SmsService.getHistory(page);
    res.status(result.success ? 200 : 400).json(result);
  }
}