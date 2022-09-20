const router = require("express").Router();
const Trip = require("../models/Trip.model");
const Review = require("../models/Review.model");

//require cloudinary

const fileUploader = require("../config/cloudinary.config");
const { default: mongoose } = require("mongoose");

//  POST /api/reviews  -  Creates a new review

router.post("/", fileUploader.single("imageURL"), (req, res, next) => {
  // console.log("file is: ", req.file)

  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }

  const { title, description, date, publicOrPrivate, trip } = req.body;
  // console.log(req.body);

  Review.create({
    title,
    description,
    date,
    publicOrPrivate,
    imageURL: req.file.path,
    trip,
  })
    .then((newReview) => {
      // console.log(newReview);
      return Trip.findByIdAndUpdate(
        trip,
        { $push: { reviews: newReview._id } },
        { new: true }
      );
      // return Trip.findByIdAndUpdate(tripId, { $set: {review: newReview._id}}, {new: true})
    })
    .then((value) => res.status(201).json(value))
    .catch((err) => res.json(err));
});

// GET /api/reviews -  Retrieves all of the reviews

router.get("/", (req, res, next) => {
  Review.find()
    // .populate('owner')
    .populate("trip")
    .then((allReviews) => res.json(allReviews)) //why here we don;t use .status(201)
    .catch((err) => res.json(err));
});

//  GET /api/reviews/:reviewId -  Retrieves a specific review by id

router.get("/:reviewId", async (req, res, next) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  const review = await Review.findById(reviewId)
  if(!review) {
      res.status(400).json({message: `Review id ${reviewId} does not exist`});
      return;
  }

  Review.findById(reviewId)
    .populate("trip")
    // .populate('owner')
    .then((trip) => res.status(201).json(trip))
    .catch((err) => res.json(err));
});

// PUT  /api/reviews/:reviewId  -  Updates a specific review by id

router.put("/:reviewId", fileUploader.single("imageURL"), async (req, res, next) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  const review = await Review.findById(reviewId)
  if(!review) {
      res.status(400).json({message: `Review id ${reviewId} does not exist`});
      return;
  }

  let imageUrl;

  if (req.file) {
    imageUrl = req.file.path;
  }

  Review.findByIdAndUpdate(
    reviewId,
    { ...req.body, imageURL: imageUrl },
    { new: true }
  )
    .then((trip) => res.json(trip))
    .catch((err) => res.json(err));
});

// DELETE  /api/reviews/:reviewId  -  Deletes a specific trip by id

router.delete("/:tripId/:reviewId", async (req, res, next) => {
  const { reviewId, tripId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  const review = await Review.findById(reviewId)
  if(!review) {
      res.status(400).json({message: `Review id ${reviewId} does not exist`});
      return;
  }

  Review.findByIdAndRemove(reviewId)
    .then(() => res.json({ message: `Review with id ${reviewId} was deleted` }))
    .catch((err) => res.json(err));

//   Trip.updateOne(tripId, {
//     $pullAll: {
//       reviews: reviewId,
//     },
//   });

const trip = await Trip.findOne({_id: tripId})
trip.reviews.pull({_id: reviewId })
await trip.save();

// const trip = await Trip.findOne({_id: tripId})
// trip.reviews.id({_id: reviewId}).remove();
// await trip.save();

});

module.exports = router;
