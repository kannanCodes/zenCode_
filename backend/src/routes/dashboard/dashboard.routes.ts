import { Router } from 'express';
import { DashboardController } from '../../controllers/dashboard/DashboardController';
import { DashboardService } from '../../services/dashboard/DashboardService';
import { DashboardRepository } from '../../repositories/dashboard/DashboardRepository';
import { authMiddleware } from '../../middlewares/auth.middleware';

const dashboardRepo = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepo);
const dashboardController = new DashboardController(dashboardService);

const router = Router();

router.get('/', authMiddleware, dashboardController.getDashboard);

export default router;
