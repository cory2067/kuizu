const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20");

const User = require("./models/user");

// gets user from DB, or makes a new account if it doesn't exist yet
async function getOrCreateGoogleUser(profile) {
  // the "sub" field means "subject", which is a unique identifier for each user
  const existingUser = await User.findOne({ googleid: profile.id });
  if (existingUser) return existingUser.toJSON();
  const newUser = new User({
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    googleid: profile.id,
  });
  return (await newUser.save()).toJSON();
}

// set up passport configs
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.PASSPORT_GOOGLE_ID,
      clientSecret: process.env.PASSPORT_GOOGLE_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      getOrCreateGoogleUser(profile)
        .then((userJson) => done(null, userJson))
        .catch(done);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id).then((user) => {
    done(null, user.toJSON());
  });
});

module.exports = passport;
