import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true  //for optimised searching
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate:{
            validator: async function(value){
               // Regular expression to match the email format
               return /\S+@\S+\.\S+/.test(value);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
        trim: true,
        select: false,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true 
    },
    refreshToken:{
        type: String,
    },
},{timestamps: true});



userSchema.pre("save", async function (next){ 
    if(!this.isModified("password"))return next();
    this.password =await bcrypt.hash(this.password,10);
    next();
})


userSchema.methods.isPasswordCorrect = async function (password) {  // methods is is used to add any property  in the schema
    console.log(password, "this.password", this.password)
    return await bcrypt.compare(password, this.password);
}



userSchema.methods.generateAccessToken = function (){
   return jwt.sign(
        { // this is payload i.e user info will be stored in jwt token
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCCES_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCCES_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){ // these methods are used generate token using payload provided here like this_id
    return jwt.sign(
         { // this is payload i.e user info will be stored in jwt token
             _id: this._id,
         },
         process.env.REFRESH_TOKEN_SECRET_KEY,
         {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
     )
 }



export const User = mongoose.model("User", userSchema);


// to get ssl certificates
// 1 generate a private key
//1>openssl genrsa -out key.pem
// 2 create csr(certificate signing request)
//2>openssl req -new -key key.pem -out csr.pem
//3 generate ssl certificate using csr after getting ssl certificate we can delete csr.pem file it
//3>  openssl x509 -req -days 20 -in csr.pem -signkey key.pem -out cert.pem