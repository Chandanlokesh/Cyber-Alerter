const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addUserProduct, viewUserProducts, updateUserRoleToPro,deleteUserProduct,getUserDetails } = require('../controllers/userController');

router.post('/user/add-products', authMiddleware, addUserProduct);
router.get('/user/view-products', authMiddleware, viewUserProducts);
router.put('/user/upgrade-role', authMiddleware, updateUserRoleToPro);
router.delete('/user/delete-product', authMiddleware, deleteUserProduct);
router.get('/user/details', authMiddleware, getUserDetails);


module.exports = router;
