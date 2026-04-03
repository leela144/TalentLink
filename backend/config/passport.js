
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          return done(null, user)
        }

        // Check if user exists with email
        const email = profile.emails[0].value
        user = await User.findOne({ email })

        if (user) {
          // Link google id to existing user
          user.googleId = profile.id
          user.authProvider = 'google'
          if (!user.profilePhoto) user.profilePhoto = profile.photos[0].value
          await user.save()
          return done(null, user)
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          profilePhoto: profile.photos[0].value,
          role: 'freelancer', // Default role
          authProvider: 'google',
          isEmailVerified: true
        })

        done(null, user)
      } catch (err) {
        done(err, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})