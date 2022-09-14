const router = require("express").Router();

const tripRouter = require ("./trip.routes")
const reviewRouter = require ("./review.routes")

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use ("/trips" , tripRouter)
router.use ("/reviews", reviewRouter)

// You put the next routes here 👇
// example: router.use("/auth", authRoutes)

module.exports = router;
