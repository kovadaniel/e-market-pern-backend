const Router = require('express');
const router = new Router();
const UserController = require("../controllers/userController");
//const authMiddleware = require("../middleware/authMiddleware");
const checkMiddleware = require('../middleware/authMiddleware');

router.post('/registration', UserController.registration)
router.post('/login', UserController.login)
router.delete('/', checkMiddleware(), UserController.delete)
router.get('/auth', checkMiddleware(), UserController.check)

module.exports = router;