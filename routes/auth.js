const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// REGISTER NEW USER
router.post('/register', async (req,res)=>{
   
    try {
        // Generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        // Create new user
        const newUser = new User({
            username : req.body.username,
            email : req.body.email,
            password : hashedPassword,
        });

        // Save new user and return response 
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json(error)
    }
})

// LOGIN

router.post('/login', async (req, res)=>{
   try {
    const user = await User.findOne({email : req.body.email});
    if(!user){res.status(404).json("user not found!")}

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if(!validPassword){res.status(400).json('Incorrect password')}

    res.status(200).json(user);
   } catch (error) {
     res.status(401).json(error)
   }
})

module.exports = router