import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { appConfig } from './appConfig';

passport.use(
  new GoogleStrategy(
    {
      clientID: appConfig.google.clientId,
      clientSecret: appConfig.google.clientSecret,
      callbackURL: appConfig.google.callbackUrl || `${appConfig.nodeEnv === 'production' ? process.env.BACKEND_URL : `http://localhost:${appConfig.port}`}/api/auth/google/callback`,
    },
    (_accessToken, _refreshToken, profile, done) => {
      return done(null, profile as unknown as Express.User);

    },
  ),

);

export default passport;
