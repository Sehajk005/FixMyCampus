const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
