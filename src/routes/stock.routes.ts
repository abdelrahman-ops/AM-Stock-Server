import { Router } from 'express';
import * as controller from '../controllers/stock.controller';
import { protect, role } from '../middleware/auth.middleware';

const router = Router();

const adminRoles = ['admin', 'superadmin'];
const superadminOnly = ['superadmin'];



router.route('/')
    .get(controller.getStocks) //done
    .post(protect, role(...adminRoles), controller.createStock); //done


router.route('/prices')
    .patch(protect, role(...adminRoles), controller.updateStockPrices);


router.route('/:symbol')
    .get(controller.getStockBySymbol) //done
    .put(protect, role(...adminRoles), controller.updateStock) //done
    .delete(protect, role(...superadminOnly), controller.deleteStock); //done

export default router;