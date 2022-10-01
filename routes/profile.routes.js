const router = require('express').Router()
const { default: mongoose } = require('mongoose');
const User = require('../models/User.model')
const Trip = require('../models/Trip.model');
const Review = require('../models/Review.model')

///// Get user by id

router.get ('/:userId', async (req, res, next) =>{
    const {userId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({message: "Specified id is not valid"});
        return;
    }

    const user = await User.findById(userId)
    if(!user) {
        res.status(400).json({message: `User id ${userId} does not exist`});
        return;
    }

    User.findById(userId)
    .populate('trips')
    .then((user) => res.json(user))
    .catch(err => res.json(err))
})

///// Delete user

router.delete("/:userId", async (req, res, next) => {
    const {userId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(userId)){
        res.status(400).json({message: "Specified id is not valid"})
        return;
    }

    const user = await User.findById(userId)
    if(!user) {
        res.status(400).json({message: `User id ${userId} does not exist`})
        return;
    }
    
    User.findByIdAndDelete(userId)
    .then((deletedUser) =>{
        deletedUser.trips.forEach(async (tripId)=>{
           await Trip.findByIdAndDelete(tripId)
        })
         deletedUser.reviews.forEach (async (reviewId) => {
           await Review.findByIdAndDelete(reviewId)
        })
     })
    .then(()=>{
        res.status(200).json({message: `User with id ${userId} was deleted`})
    })
    .catch((err)=>res.json(err))

})

module.exports = router;