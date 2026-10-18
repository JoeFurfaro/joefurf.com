import Stripe from "stripe";
import { config } from "./config.js";

export const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;
