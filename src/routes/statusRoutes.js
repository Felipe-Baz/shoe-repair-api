const express = require('express');
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/columns', statusController.getStatusColumns);

module.exports = router;