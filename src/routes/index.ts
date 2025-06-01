import express from "express";
import stockRoutes from './stock.routes';
import userRoutes from './user.routes'
import adminRoutes from './admin.routes'

const routes = express.Router();

routes.use('/stocks', stockRoutes);
routes.use('/users', userRoutes);
routes.use('/admin', adminRoutes)
// routes.use('/auth', authRoutes);


export default routes