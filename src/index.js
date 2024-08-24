import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import cookieParser from 'cookie-parser';
import { User } from "./model.js";
import { Server } from "socket.io";
import { createServer } from "https";
import cors from "cors";
import QRCode from "qrcode";
import qr from "qr-image"
import fs, { access } from "fs";
import { fileURLToPath } from 'url';
import path from "path";
// Load environment variables from .env file

dotenv.config({
  path: ".env",
});

const app = express();


// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path to the certificate directory
const certificateDir = path.join(__dirname, "..", "certificate");

// Read SSL certificate and key
const sslOptions = {
  key: fs.readFileSync(path.join(certificateDir , "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "..", "certificate", "cert.pem")),
};


app.use(
  cors({
    // origin: Specifies which origins are allowed to access the resources on your server.
    // Setting the allowed origin(s) for cross-origin requests
    // 'process.env.COR_ORIGIN' should contain the actual origin(s) in production
    origin: [
      process.env.COR_ORIGIN,
      "https://localhost:3000",
      "http://localhost:4173",
    ],

    // Allowing credentials to be included in cross-origin requests
    // (e.g., when using cookies or HTTP authentication)
    credentials: true,
  })
);

const sslServer =  createServer(sslOptions,app)
const server = createServer(app);
const io = new Server(sslServer, { 
  cors: { 
    origin: ["http://localhost:5173", "https://localhost:3000"], 
    methods: ["GET", "POST"],
    credentials: true
   }
  });




app.use(express.json({ limit: "20kb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const port = process.env.PORT || 5000;
const DB_NAME = "grov01"


const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/grov01`);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

connectDB();

// middleware functions
const verifyJWT =  async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");// Bearer token that is why split(" ")[1]
    if(!token){
        throw new Error("Invalid access token")
    }

    const decodedToken =  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
   
    try {
        const user = await User.findById(decodedToken._id).select("-refreshToken -password")
       // console.log(user,refreshToken)
        if(!user){
            message = "No user found while verifying authentication using accessToken"
            throw new Error(message)
        }
        req.user = user
        next()
    } catch (error) {
         console.log(error)
         res.status(401).json({ msg: "Invalid access token" })
    }
}


//create user 

const createUser = async (req, res) => {
   try {
     const { username, email, password,fullName } = req.body
     if(!email){
         return res.status(400).json({ msg: "Please include an email" });
     }
     if(!password){
         return res.status(400).json({ msg: "Please include a password" });
     }
     if(!fullName || !username){
         return res.status(400).json({ msg: "Please include username and fullname" });
     }
 
     const existingUser = await User.findOne({ email });
     if (existingUser) {
       return res
        .status(404)
        .json({ msg: "Email already exists, please choose a different one." });
     }
     
     const newUser = await User.create({
         username,
         email,
         password,
         fullName
     })
 
     if(!newUser){
         return res.status(500).json({msg:"Internal server error"})
     }
 
     res.status(201).json({ msg: "User created successfully" });
 
   } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Server error" });
   }
}

const login = async (req, res) => {
    try {
       console.log("hi")
        const { email, password} = req.body;
        if(!email ||!password){
            return res.status(400).json({ msg: "Please include email and password" });
        }

        const user = await User.findOne({ email }).select("+password");
        if(!user){
            return res.status(404).json({ msg: "User not found" });
        }
        console.log(user)
        if(!await user.isPasswordCorrect(password)){
            return res.status(401).json({ msg: "Invalid password" });
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();
        console.log(user)
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
        return res.
            status(200).
            cookie("accessToken", accessToken, options).
            cookie("refreshToken", refreshToken, options).
            json({msg:"Login successful", userId:user.id, name:user.fullName})
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Server error" });
    }
}

app.get("/", (req, res) => {
  res.send("Hello from SSLserver");
})


app.post("/signUp", createUser);
app.post('/login', login);

io.on('connection', (socket) => {
    console.log("Connection established")
    
    socket.on('join-room', ({ deviceId, userId}) => {
      if (deviceId) {
        console.log(`Device ID ${deviceId} joined room`);
        socket.join(deviceId);
        console.log(`Device ID ${deviceId} joined room`);
      }

      if (userId) {
        socket.join(userId);
        console.log(`User ID ${userId} joined room`);
      }
    });

    socket.on('scan-qr', async ({ qrToken, deviceId, userId }) => {
       try {
        console.log("Scanning", qrToken, deviceId, userId)
        if(qrToken !== process.env.QR_TOKEN_SECRET){
            io.to(deviceId).emit('login-failed', 'Invalid QR token');
        }

        const user = await User.findById(userId);
      
        console.log("User:", user.fullName, "\n user when he scanned qr")
        if(!user){
          io.to(deviceId).to(userId).emit('login-failed', 'Invalid QR token');
        }
        
        if (user) {
          console.log("emiiting login-success")
          const accessToken = await user.generateAccessToken();
          const refreshToken = await user.generateRefreshToken();
          user.refreshToken = refreshToken;
          // Emit login-success to the specific device ID
          io.to(deviceId).emit('login-success', {userId:user._id, accessToken:accessToken, refreshToken:refreshToken});
          
          console.log("emit login-success and emitting scanned-success")
          
          // Emit scanned-success to the specific user ID
          io.to(userId).emit("scanned-success", { userName: user.fullName});
          
          console.log("emitted scanned-success")
        } else {
          io.to(deviceId).to(userId).emit('login-failed', 'Invalid QR token');
         }
      } catch (error) {
        console.error(error);
        io.to(deviceId).to(userId).emit('login-failed', 'Invalid QR token');
      }
    });

      // Handle disconnection
  socket.on('disconnect', () => {
        console.log(`Socket ID ${socket.id} disconnected`);
     });
  });
  





// const deviceSocketMap = new Map();

// io.on('connection', (socket) => {
//   console.log("Connection established with socket ID:", socket.id);

//   socket.on('register-device', (deviceId) => {
//     deviceSocketMap.set(deviceId, socket.id);
//     console.log(`Device ID ${deviceId} registered with socket ID ${socket.id}`);
//   });

//   socket.on('scan-qr', async ({ qrToken, deviceId, userId }) => {
//     try {
//       console.log("Scanning", qrToken, deviceId, userId);
//       if (qrToken !== process.env.QR_TOKEN_SECRET) {
//         io.to(deviceSocketMap.get(deviceId)).emit('login-failed', 'Invalid QR token');
//         return;
//       }
//       const user = await User.findById(userId);
//       if (user) {
//         const accessToken = user.generateAccessToken();
//         const refreshToken = user.generateRefreshToken();
//         io.to(deviceSocketMap.get(deviceId)).emit('login-success', { accessToken, refreshToken });
//         io.to(deviceSocketMap.get(deviceId)).emit('scanned-success', { userName: user.fullName });
//       } else {
//         io.to(deviceSocketMap.get(deviceId)).emit('login-failed', 'Invalid QR token');
//       }
//     } catch (error) {
//       console.error(error);
//       io.to(deviceSocketMap.get(deviceId)).emit('login-failed', 'An error occurred');
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log(`Socket ID ${socket.id} disconnected`);
//     for (let [deviceId, sockId] of deviceSocketMap.entries()) {
//       if (sockId === socket.id) {
//         deviceSocketMap.delete(deviceId);
//         break;
//       }
//     }
//   });
// });


sslServer.listen(port,()=>console.log(`SSLServer running on port ${port}`));

// server.listen(port, () => console.log(`Server running on port ${port}`));
// // Middleware
