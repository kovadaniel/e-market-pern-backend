const Router = require('express');
const router = new Router();
const BasketController = require("../controllers/basketController");
const authMiddleware = require("../middleware/authMiddleware");

router.get('/', authMiddleware(), BasketController.get);

module.exports = router; 