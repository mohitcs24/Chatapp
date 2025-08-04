import express from "express";
import { login, signup , logout, onboard } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";




const router = express.Router();

// router.get("/signup", (req, res) => {
//     res.send("Signup Route");
// });

//import signup from auth controllerS
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);


//forget password

//check if user is logged in 
 router.get("/me", protectRoute, (req, res) =>{
    res.status(200).json({success: true, user: req.user});
 });


router.post("/onboarding",protectRoute, onboard)
export default router;
  