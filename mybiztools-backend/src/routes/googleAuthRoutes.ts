import { Router, Request, Response } from 'express';
import passport from '../config/passport.js';
import { AuthService } from '../services/authService.js';
import { env } from '../config/env.js';


const router = Router();

/**
 * @swagger
 * tags:
 *   name: Google Auth
 *   description: Google OAuth2 authentication
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Google Auth]
 *     responses:
 *       302: { description: Redirects to Google login page }
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Google Auth]
 *     responses:
 *       302: { description: Redirects to frontend with token }
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.frontendUrl}/login?error=google_auth_failed`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        return res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
      }

      // Update last login
    //   AuthService['prisma'] ?? null;
    //   import('../lib/prisma.js').then(({ default: prisma }) => {
    //     prisma.user.update({
    //       where: { id: user.id },
    //       data:  { lastLoginAt: new Date() },
    //     }).catch(() => {});
    //   });

import('../lib/prisma.js').then(({default : prisma }) => {
    prisma.user.update({
        where: {id: user.id},
        data: {lastLoginAt: new Date()},
    }).catch(() => {});
});

      const token = AuthService.generateToken(user.id, user.email);

      // Redirect to frontend with token
      return res.redirect(
        `${env.frontendUrl}/auth/google/success?token=${token}&userId=${user.id}`
      );
    } catch (err) {
      console.error('[Google Auth] Callback error:', err);
      return res.redirect(`${env.frontendUrl}/login?error=google_auth_failed`);
    }
  }
);

export default router;