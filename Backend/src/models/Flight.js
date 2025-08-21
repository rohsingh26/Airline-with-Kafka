import mongoose from "mongoose";

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

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
