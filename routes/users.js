const router = require('express').Router(); 
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Update user
router.put('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
       if(req.body.password){
        try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt)
        } catch (error) {
            return res.status(500).json(error);
        }
       }
       try {
          const user = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        });
        res.status(200).json('Updated user')
       } catch (error) {
        return res.status(500).json(error);
       }
    }else{
        return res.status(403).json('unauthorized request')
    }
});

// Delete a user
router.delete('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
       try {
          const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json('Deleted user')
       } catch (error) {
        return res.status(500).json(error);
       }
    }else{
        return res.status(403).json('unauthorized request')
    }
});

// Get a user
router.get('/:id', async(req, res)=>{
    try {
       const user = await User.findById(req.params.id)
       const {password, updatedAt, isAdmin, ...other} = user._doc 
       res.status(200).json(other)
    } catch (error) {
       return res.status(500).json(error) 
    }
});

// Follow a user
router.put('/:id/follow', async(req,res)=>{
    if(req.body.userId !== req.params.id){
       try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(!user.followers.includes(req.body.userId)){
           await user.updateOne({$push: {followers: req.body.userId}});
           await currentUser.updateOne({$push: {following: req.params.id}})
           res.status(200).json('sucessfully followed');
        }else{
            res.status(403).json('already following');
        }
       } catch (error) {
        res.status(500).json(error);
       }
    }else{
        res.status(403).json('You cannot follow self')
    }
});

// Unfollow a user
router.put('/:id/unfollow', async(req,res)=>{
    if(req.body.userId !== req.params.id){
       try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(user.followers.includes(req.body.userId)){
           await user.updateOne({$pull: {followers: req.body.userId}});
           await currentUser.updateOne({$pull: {following: req.params.id}})
           res.status(200).json('sucessfully unfollowed');
        }else{
            res.status(403).json('already unfollowing');
        }
       } catch (error) {
        res.status(500).json(error);
       }
    }else{
        res.status(403).json('You cannot unfollow self')
    }
});



module.exports = router ;