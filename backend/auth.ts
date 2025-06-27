import session from 'express-session';
import passport from 'passport';
import SteamStrategy from 'passport-steam';
import type { Express } from 'express';

export interface SteamUser {
  id: string;
  displayName: string;
  profileUrl: string;
  avatar: string;
  steamId: string;
}

interface SteamProfile {
  id: string;
  displayName: string;
  _json: {
    profileurl: string;
    avatarfull: string;
  };
}

export function setupAuth(app: Express): void {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Steam authentication strategy
  passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/api/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: process.env.STEAM_API_KEY || 'your-steam-api-key',
  }, (identifier: string, profile: SteamProfile, done: (error: Error | null, user?: SteamUser) => void) => {
    // Store user profile in session
    return done(null, {
      id: profile.id,
      displayName: profile.displayName,
      profileUrl: profile._json.profileurl,
      avatar: profile._json.avatarfull,
      steamId: profile.id,
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}
