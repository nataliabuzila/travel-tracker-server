const router = require ("express").Router()
const Trip = require ("../models/Trip.model")
const Review = require ("../models/Review.model")
const User = require("../models/User.model");

//require cloudinary

const fileUploader = require('../config/cloudinary.config');
const { default: mongoose } = require("mongoose");


/////  POST /api/trips  -  Creates a new trip

router.post('/', fileUploader.single('imageURL'), (req, res, next) => {

    // console.log("file is: ", req.file)

    // if (!req.file) {
    //     next(new Error("No file uploaded!"));
    //     return;
    // }

    const {title, description, country, city, startDate, endDate, status, publicOrPrivate, owner} = req.body;

    Trip.create({title, description, country, city, startDate, endDate, status, publicOrPrivate, imageURL: req?.file?.path, owner, reviews: [] })
    .then((newTrip) => {
        return User.findByIdAndUpdate(owner, { $push: { trips: newTrip._id } }, { new: true })
    })
    .then((value) => res.status(201).json(value))
    .catch((err) => res.json(err))
})

///// GET /api/trips -  Retrieves all of the trips

router.get('/', (req, res, next) => {
    Trip.find()
    .populate('reviews')
    .populate('owner')
    .then(allTrips => res.json(allTrips))
    .catch(err=> res.json(err))
})

/////  GET /api/trips/:tripId -  Retrieves a specific trip by id

router.get('/:tripId', async (req, res, next) =>{
    const {tripId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({message: "Specified id is not valid"});
        return;
    }

    const trip = await Trip.findById(tripId)
    if(!trip) {
        res.status(400).json({message: `Trip id ${tripId} does not exist`});
        return;
    }

    Trip.findById(tripId)
    .populate('reviews')
    .populate('owner')
    .then(trip => res.status(201).json(trip))
    .catch(err => res.json(err))
})

////// PUT  /api/trips/:tripId  -  Updates a specific trip by id

router.put ('/:tripId', fileUploader.single('imageURL'), async (req, res, next) =>{
    const {tripId} = req.params;
    // const {title, description, country, startDate, endDate, status, publicOrPrivate } = req.body;

    if(!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({message: "Specified id is not valid"});
        return;
    }

    const trip = await Trip.findById(tripId)
    if(!trip) {
        res.status(400).json({message: `Trip id ${tripId} does not exist`});
        return;
    }

    let imageUrl;

    if(req.file) {
      imageUrl = req.file.path;
    }

    console.log(req.body);

    Trip.findByIdAndUpdate(tripId, {...req.body, imageURL: imageUrl }, {new: true})
    .then((trip) => res.json(trip))
    .catch(err => res.json(err))
})

///// DELETE  /api/trips/:tripId  -  Deletes a specific trip by id

router.delete('/:ownerId/:tripId', async (req, res, next) =>{
    const {ownerId, tripId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(tripId)) {
        res.status(400).json({message: 'Specified id is not valid'});
        return;     
    }

    const trip = await Trip.findById(tripId)
    if(!trip) {
        res.status(400).json({message: `Trip id ${tripId} does not exist`});
        return;
    }

    const owner = await User.findOne({_id: ownerId})
    //const deletedTrip = Trip.findByIdAndDelete(tripId)
    // if(deletedTrip.reviews.length>0) {deletedTrip.reviews.forEach ((reviewId) => {Review.findByIdAndDelete(reviewId)})}
    Trip.findByIdAndDelete(tripId)
    .then((deletedTrip) => {
        deletedTrip.reviews.forEach ((reviewId) => {
            owner.reviews.pull({_id: reviewId })
            Review.findByIdAndDelete(reviewId)
            .catch((err) => res.json(err));
        })
    })
    .then(()=> res.json({message:`Trip with id ${tripId} was deleted`}))
    .catch(err => res.json(err))

    owner.trips.pull({_id: tripId })
    await owner.save();
})

module.exports = router