import mongoose from "mongoose";

const baggageSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flight",
      required: true,
    },
    weight: { type: Number },
    status: {
      type: String,
      enum: [
        "checkin",
        "loaded",
        "inTransit",
        "unloaded",
        "atBelt",
        "lost",
      ],
      default: "checkin",
    },
    lastLocation: { type: String },
  },
  {
    timestamps: true,
  }
);

const Baggage = mongoose.model("Baggage", baggageSchema);

export default Baggage;
