import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import flightRoutes from "./flightRoutes.js";
import baggageRoutes from "./baggageRoutes.js";
import passengerRoutes from "./passengerRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/flights", flightRoutes);
router.use("/baggage", baggageRoutes);
router.use("/passengers", passengerRoutes);

export default router;
