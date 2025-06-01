import express from 'express';
import { 
    getUserProfile, 
    loginUser, 
    registerUser,
    updateUserProfile 
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', registerUser); // done
router.post('/login', loginUser); // done

router.route('/profile')
    .get(protect, getUserProfile) //done
    .put(protect, updateUserProfile); //done

export default router;