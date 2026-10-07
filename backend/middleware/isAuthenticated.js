import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js'
import { Session } from '../models/sessionModel.js'

export const isAuthenticated = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
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
                return res.status(401).json({
                    success:false,
                    message:'Access token has expired. Please log in again.'
                })
            }
            return res.status(401).json({
                success:false,
                message:'Access token is missing or invalid'
            })
        }
        if(decoded.tokenType !== 'access'){
            return res.status(401).json({success:false,message:'A valid access token is required'})
        }
        const user = await User.findById(decoded.id)
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User not found'
            })
        }
        const session = await Session.findOne({userId:user._id})
        if(!session){
            return res.status(401).json({
                success:false,
                message:'Your session has expired. Please log in again.'
            })
        }
        req.user = user
        req.id = user._id
        next()
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export const isAdmin = async (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next()
    }else{
        return res.status(403).json({
            success:false,
            message:'Access denied. Admins only.'
        })
    }
}
