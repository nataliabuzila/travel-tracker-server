const mongoose = require ("mongoose")
const {Schema, model} = mongoose

const reviewSchema = new Schema (
{
    title: { 
        type: String, 
        required: [true, 'Title is required.']
    },

    description: String,

    date: { type: Date, default: Date.now },

    imageURL: {
        type: String,
        default: "images/trip-image.PNG"
    },

    publicOrPrivate: { 
        type: String, 
        enum: ["Public", "Private"],
        required: true
    },

    owner: { type: Schema.Types.ObjectId, ref: 'User'},

    trip: {type: Schema.Types.ObjectId, ref: 'Trip'},
},
{
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
}
);

module.exports = model("Review", reviewSchema);