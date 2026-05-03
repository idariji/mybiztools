import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';
import { env } from './env.js';


passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const firstName = profile.name?.givenName ?? null;
        const lastName = profile.name?.familyName ?? null;
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        if (!email) {
          return done(new Error('No email returned from Google'), undefined);
        }

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              avatarUrl,
              password: '',   // no password for OAuth users
              emailVerified: true,   // Google already verified the email
              currentPlan: 'free',
              subscriptionStatus: 'active',
            },
          });
        } else if (!user.emailVerified) {
          // If user registered manually but not verified, verify them now
          user = await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, avatarUrl: avatarUrl ?? user.avatarUrl },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;