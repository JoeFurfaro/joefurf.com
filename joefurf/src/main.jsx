import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);


