const jwt = require('jsonwebtoken') ;
const AppError = require('./AppError') ;


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';


if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in environment variables. Please add it to your .env file.');
}

const signToken = (userId , role = 'customer') =>{
    return jwt.sign(
        {
            userId,
            role
        } ,
        JWT_SECRET,
        {expiresIn : JWT_EXPIRES_IN}
    )
} ;


const verifyToken = (token) =>{
    try {
        return jwt.verify(token , JWT_SECRET) ;
    } catch (error){
        if(error.name === 'TokenExpiredError'){
            throw new AppError('Token has expired please login again' , 401) ;
        }
        if(error.name === 'JsonWebTokenError'){
            throw new AppError('invalid please login again' , 401) ;  
        }
        throw error ;
    }
} ;



const extractToken = (req) =>{
    let token ;
   
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
       token = req.headers.authorization.split(' ')[1] ;
    }
    if(!token) {
        throw new AppError('you are not logged in , please login to get access' , 401)
    }

    return token ;
} ;


module.exports = {
    signToken,
    verifyToken,
    extractToken,
    JWT_SECRET,
    JWT_EXPIRES_IN
} ;
