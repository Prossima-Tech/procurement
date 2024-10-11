const router = require('express').Router();

router.get('/hello', async(req,res)=>{
  res.json("hello from auth router")
})
module.exports = router