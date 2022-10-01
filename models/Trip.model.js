const mongoose = require ("mongoose")
const {Schema, model} = mongoose

const tripSchema = new Schema (
    {
        title: { 
            type: String, 
            required: true
        },

        description: String,
        country: String,
        city: String,
        startDate: Date,
        endDate: Date,

        // imageURL: {
        //     type: String,
        //     default: "images/trip-image.PNG"
        // },

        status: { 
            type: String,
            enum: ["Completed", "Planned"],
            required: true
        },

        publicOrPrivate: { 
            type: String, 
            enum: ["Public", "Private"],
            required: true
        },

        owner: { type: Schema.Types.ObjectId, ref: 'User'},
        reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

module.exports = model("Trip", tripSchema);