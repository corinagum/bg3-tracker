import type { Express } from 'express';
import passport from 'passport';

export function setupRoutes(app: Express): void {
  // API routes
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  app.get('/api/auth/steam', passport.authenticate('steam'));

  app.get('/api/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    },
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });
}
