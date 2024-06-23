const express = require('express');
const { register, login, getUserDetails, getUsers } = require('../controllers/authController');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const upload = multer({ dest: 'src/uploads/' });

const router = express.Router();

router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.get('/user', authMiddleware, getUserDetails); // get user details
router.get('/getUsers', getUsers);

module.exports = router;
