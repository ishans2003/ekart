import { User } from "../models/userModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { verifyEmail } from "../emailVerify/verifyEmail.js"
import { Session } from "../models/sessionModel.js"
import { sendOTPMail } from "../emailVerify/sendOTPMail.js"
import { randomInt } from "node:crypto"


export const register = async(req,res)=>{
    try{
        const { firstName, lastName, email, password } = req.body
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
        if (!firstName?.trim() || !lastName?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }
        let user = await User.findOne({ email: normalizedEmail })
        if(user?.isVerified){
            return res.status(409).json({
                success:false,
                message:'An account with this email already exists. Please log in.'
            })
        }
        if (!user) {
            const hashedPassword = await bcrypt.hash(password,10)
            user = await User.create({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: normalizedEmail,
                password: hashedPassword
            })
        }
        const token = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:'10m'})
        user.token = token
        await user.save()
        try {
            await verifyEmail(token,normalizedEmail)
        } catch (emailError) {
            console.error("Verification email failed:", emailError.message)
            return res.status(503).json({
                success:false,
                message:'Account saved, but the verification email could not be sent. Check mail settings, then submit signup again to retry.'
            })
        }
        return res.status(201).json({
            success:true,
            message:'Verification email sent. Check your inbox before logging in.',
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const verify = async(req,res)=>{
    try{
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(400).json({
                success:false,
                message:'Authorization token missing or invalid'
            })
        }
        const token = authHeader.split(' ')[1]//Bearer token
        let decoded
        try{
            decoded = jwt.verify(token,process.env.SECRET_KEY)
        }catch(error){
            if(error.name === 'TokenExpiredError'){
                return res.status(400).json({
                    success:false,
                    message:'Token expired'
                })
            }
            return res.status(400).json({
                success:false,
                message:'Token verification failed'
            })
        }
        const user = await User.findById(decoded.id)
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        if(user.isVerified || user.token !== token){
            return res.status(400).json({
                success:false,
                message:'This verification link is invalid or has already been used. Request a new link.'
            })
        }
        user.token = null
        user.isVerified = true
        await user.save()
        return res.status(200).json({
            success:true,
            message:'Email verified successfully',
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const reVerify = async(req,res)=>{
    try{
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        if (user.isVerified) {
            return res.status(409).json({success:false, message:'This account is already verified. Please log in.'})
        }
        const token = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:'10m'})
        user.token = token
        await user.save()
        try {
            await verifyEmail(token,email)
        } catch (emailError) {
            console.error("Verification email resend failed:", emailError.message)
            return res.status(503).json({success:false, message:'Could not send verification email. Check the backend mail settings and try again.'})
        }
        return res.status(200).json({
            success:true,
            message:'Verification email sent successfully'
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const authenticateUser = async(req,res,requiredRole=null)=>{
    try{
        const { email, password } = req.body
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
        if(!normalizedEmail || !password){
            return res.status(400).json({
                success:false,
                message:'Email and password are required'
            })
        }
        const existingUser = await User.findOne({email: normalizedEmail})
        if(!existingUser){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        const isPasswordValid = await bcrypt.compare(password,existingUser.password)
        if(!isPasswordValid){
            return res.status(400).json({
                success:false,
                message:'Invalid password'
            })
        }
        if(existingUser.isVerified === false){
            return res.status(400).json({
                success:false,
                message:'Verify your account first then try to login'
            })
        }
        if(requiredRole && existingUser.role !== requiredRole){
            return res.status(403).json({success:false,message:'This account does not have administrator access'})
        }

        //generate token
        const accessToken = jwt.sign({id:existingUser._id,tokenType:'access'},process.env.SECRET_KEY,{expiresIn:'10d'})
        const refreshToken = jwt.sign({id:existingUser._id,tokenType:'refresh'},process.env.SECRET_KEY,{expiresIn:'30d'})

        existingUser.isLoggedIn = true
        await existingUser.save()

        //check if user already has a session, if yes delete it and create a new one
        const existingSession = await Session.findOne({userId:existingUser._id})
        if(existingSession){
            await Session.deleteOne({userId:existingUser._id})
        }
        
        //create a new session for the user
        await Session.create({
            userId:existingUser._id
        })
        const safeUser = existingUser.toObject()
        delete safeUser.password
        delete safeUser.token
        delete safeUser.otp
        delete safeUser.otpExpiry
        delete safeUser.passwordResetVerifiedUntil
        return res.status(200).json({
            success:true,
            message:`Welcome back ${existingUser.firstName} ${existingUser.lastName}`,
            user:safeUser,
            accessToken,
            refreshToken
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const login = (req,res) => authenticateUser(req,res)
export const adminLogin = (req,res) => authenticateUser(req,res,'admin')

export const refreshAccessToken = async(req,res)=>{
    try{
        const { refreshToken } = req.body
        if(!refreshToken){
            return res.status(401).json({success:false,message:'Refresh token is required'})
        }
        let decoded
        try{
            decoded = jwt.verify(refreshToken,process.env.SECRET_KEY)
        }catch{
            return res.status(401).json({success:false,message:'Refresh token is invalid or expired. Please log in again.'})
        }
        if(decoded.tokenType !== 'refresh'){
            return res.status(401).json({success:false,message:'A refresh token is required'})
        }
        const user = await User.findById(decoded.id)
        const session = user && await Session.findOne({userId:user._id})
        if(!user || !session){
            return res.status(401).json({success:false,message:'Your session has expired. Please log in again.'})
        }
        const accessToken = jwt.sign({id:user._id,tokenType:'access'},process.env.SECRET_KEY,{expiresIn:'10d'})
        return res.status(200).json({success:true,accessToken})
    }catch(error){
        return res.status(500).json({success:false,message:error.message})
    }
}

export const logout = async(req,res)=>{
    try{
        const userId = req.id
        await Session.deleteOne({userId:userId})
        await User.findByIdAndUpdate(userId,{isLoggedIn:false})
        return res.status(200).json({
            success:true,
            message:'Logged out successfully'
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const forgotPassword = async(req,res)=>{
    try{
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
        if(!email){
            return res.status(400).json({
                success:false,
                message:'Email is required'
            })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        const otp = randomInt(100000, 1000000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) //10 minutes
        user.otp = otp
        user.otpExpiry = otpExpiry
        user.passwordResetVerifiedUntil = null
        await user.save()
        try {
            await sendOTPMail(otp,email)
        } catch (emailError) {
            user.otp = null
            user.otpExpiry = null
            console.error("Password reset email failed:", emailError.message)
            try {
                await user.save()
            } catch (cleanupError) {
                console.error("Could not clear the unsent password reset code:", cleanupError.message)
            }
            return res.status(503).json({success:false, message:'Could not send reset code. Check the backend mail settings and try again.'})
        }
        return res.status(200).json({
            success:true,
            message:'OTP sent to your email successfully'
        })
    }catch(error){
        console.error("Forgot password request failed:", error.stack || error.message)
        return res.status(500).json({
            success:false,
            message:'Could not process the password reset request. Check the backend terminal for details.'
        })
    }
}

export const verifyOTP = async(req,res)=>{
    try{
        const {otp} = req.body
        const email = req.params.email
        if(!otp){
            return res.status(400).json({
                success:false,
                message:'OTP is required'
            })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        if(!user.otp || !user.otpExpiry){
            return res.status(400).json({
                success:false,
                message:'OTP not generated or already verified'
            })
        }
        if(user.otpExpiry < new Date()){
            return res.status(400).json({
                success:false,
                message:'OTP expired'
            })
        }
        if(String(otp).trim() !== user.otp){
            return res.status(400).json({
                success:false,
                message:'Invalid OTP'
            })
        }
        user.otp = null
        user.otpExpiry = null
        user.passwordResetVerifiedUntil = new Date(Date.now() + 10 * 60 * 1000)
        await user.save()
        return res.status(200).json({
            success:true,
            message:'OTP verified successfully'
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const changePassword = async(req,res)=>{
    try{
        const { newPassword, confirmPassword } = req.body
        const email = req.params.email
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        if(!newPassword || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:'New password and confirm password are required'
            })
        }
        if(newPassword.length < 8){
            return res.status(400).json({
                success:false,
                message:'Password must be at least 8 characters long'
            })
        }
        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'New password and confirm password do not match'
            })
        }
        if(!user.passwordResetVerifiedUntil || user.passwordResetVerifiedUntil < new Date()){
            return res.status(403).json({
                success:false,
                message:'Verify the password reset code before changing your password'
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword,10)
        user.password = hashedPassword
        user.passwordResetVerifiedUntil = null
        await user.save()
        return res.status(200).json({
            success:true,
            message:'Password changed successfully'
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const allUser = async(req,res)=>{
    try{
        const users = await User.find().select('-password -token -otp -otpExpiry -passwordResetVerifiedUntil')
        return res.status(200).json({
            success:true,
            users
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const getUserById = async(req,res)=>{
    try{
        const {userId} = req.params
        if (req.id.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({success:false, message:'You can only view your own account.'})
        }
        const user = await User.findById(userId).select('-password -token -otp -otpExpiry -passwordResetVerifiedUntil')
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const updateMyProfile = async(req,res)=>{
    try{
        const editableFields = ['firstName', 'lastName', 'phoneNo', 'address', 'city', 'zipCode']
        const suppliedFields = editableFields.filter((field) => Object.hasOwn(req.body, field))
        if(suppliedFields.length === 0){
            return res.status(400).json({success:false, message:'Provide a phone number or address to update.'})
        }

        for(const field of suppliedFields){
            if(typeof req.body[field] !== 'string'){
                return res.status(400).json({success:false, message:`${field} must be text.`})
            }
        }

        for(const field of ['firstName', 'lastName']){
            if(Object.hasOwn(req.body, field) && !req.body[field].trim()){
                return res.status(400).json({success:false, message:`${field === 'firstName' ? 'First' : 'Last'} name is required.`})
            }
            if(Object.hasOwn(req.body, field) && req.body[field].trim().length > 80){
                return res.status(400).json({success:false, message:`${field === 'firstName' ? 'First' : 'Last'} name must be 80 characters or fewer.`})
            }
        }

        const phoneNo = Object.hasOwn(req.body, 'phoneNo') ? req.body.phoneNo.trim() : undefined
        if(phoneNo && !/^[+\d\s().-]{7,20}$/.test(phoneNo)){
            return res.status(400).json({success:false, message:'Enter a valid phone number (7 to 20 characters).'} )
        }
        const lengthLimits = { address:200, city:100, zipCode:20 }
        for(const field of ['address', 'city', 'zipCode']){
            if(Object.hasOwn(req.body, field) && req.body[field].trim().length > lengthLimits[field]){
                return res.status(400).json({success:false, message:`${field} must be ${lengthLimits[field]} characters or fewer.`})
            }
        }

        const user = req.user
        for(const field of suppliedFields){
            user[field] = req.body[field].trim()
        }
        await user.save()
        const safeUser = user.toObject()
        delete safeUser.password
        delete safeUser.token
        delete safeUser.otp
        delete safeUser.otpExpiry
        delete safeUser.passwordResetVerifiedUntil
        return res.status(200).json({success:true, message:'Profile updated successfully.', user:safeUser})
    }catch(error){
        return res.status(500).json({success:false, message:error.message})
    }
}

