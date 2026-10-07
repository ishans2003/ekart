import express from 'express'
import { adminLogin, forgotPassword,getUserById,allUser,changePassword,verifyOTP, login, logout, register, reVerify, verify, refreshAccessToken, updateMyProfile } from '../controllers/userController.js'
import { isAdmin, isAuthenticated } from '../middleware/isAuthenticated.js'

const router = express.Router()

router.post('/register',register)
router.post('/verify',verify)
router.post('/reverify',reVerify)
router.post('/login',login) 
router.post('/admin/login',adminLogin)
router.post('/refresh',refreshAccessToken)
router.post('/logout',isAuthenticated,logout)
router.patch('/profile',isAuthenticated,updateMyProfile)
router.post('/forgot-password',forgotPassword)
router.post('/verify-otp/:email',verifyOTP)
router.post('/change-password/:email',changePassword)
router.get('/all-user',isAuthenticated,isAdmin,allUser)
router.get('/get-user/:userId',isAuthenticated,getUserById)




export default router;
