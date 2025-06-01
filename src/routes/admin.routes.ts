import express from 'express';
import { 
    createAdminUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,  
} from '../controllers/admin.controller';
import { protect, admin, superadmin } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create-admin', protect, superadmin, createAdminUser); //done

router.route('/')
    .get(protect, admin, getUsers); //done

router.route('/:id')
    .get(protect, admin, getUserById) //done   
    .put(protect, admin, updateUser)  //done   
    .delete(protect, admin, deleteUser); //done

export default router;