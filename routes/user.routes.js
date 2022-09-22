const router = require('express').Router()
const { default: mongoose } = require('mongoose');
const Trip = require('../models/Trip.model');
const Review = require('../models/Review.model')
const User = require('../models/User.model')
const fileUploader = require('../config/cloudinary.config');

///// Update user

router.put ('/:userId', fileUploader.single('avatarURL'), async (req, res, next) =>{
    const {userId} = req.params;
    // const {title, description, country, startDate, endDate, status, publicOrPrivate } = req.body;

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({message: "Specified id is not valid"});
        return;
    }

    const user = await User.findById(userId)
    if(!user) {
        res.status(400).json({message: `User id ${userId} does not exist`});
        return;
    }

    let avatarUrl;

    if(req.file) {
        avatarUrl = req.file.path;
    }

    User.findByIdAndUpdate(userId, {...req.body, avatarUrl: avatarUrl }, {new: true})
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
