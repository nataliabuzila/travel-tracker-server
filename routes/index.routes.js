const router = require("express").Router();

const tripRouter = require ("./trip.routes")
const reviewRouter = require ("./review.routes")
const authRouter = require ("./auth.routes")

const {isAuthenticated} = require('../middleware/jwt.middleware.js')

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use ("/trips" , tripRouter)
router.use ("/reviews", reviewRouter)
router.use ("/auth", authRouter)

module.exports = router;
