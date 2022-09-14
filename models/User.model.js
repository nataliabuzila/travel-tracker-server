const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatarURL: {
      type: String,
      default: "images/user-avatar.PNG"
    },
    registrationDate: { type: Date, default: Date.now },    // `Date.now()` returns the current unix timestamp as a number
    about: String,
    trip: [{type: Schema.Types.ObjectId, ref: 'Trip'}],
    review: [{type: Schema.Types.ObjectId, ref: 'Review'}],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
