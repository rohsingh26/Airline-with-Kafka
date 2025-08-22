import mongoose from "mongoose";
import Baggage from "./Baggage.js";

const flightSchema = new mongoose.Schema(
  {
    flightNo: { type: String, unique: true, index: true, required: true },
    airlineCode: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    gate: { type: String },
    scheduledDep: { type: Date, required: true },
    scheduledArr: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "scheduled",
        "boarding",
        "departed",
        "arrived",
        "delayed",
        "cancelled",
      ],
      default: "scheduled",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Cascade delete baggage when a flight is deleted
flightSchema.pre("findOneAndDelete", async function (next) {
  try {
    const flight = await this.model.findOne(this.getFilter());
    if (flight) {
      await Baggage.deleteMany({ flightId: flight._id });
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
