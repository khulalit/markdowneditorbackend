const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User')
const cors = require('cors')
const jwt = require('express-jwt');
const jwks = require('jwks-rsa')
const  ObjectID = require('mongodb').ObjectId;

require('dotenv').config();

const PORT = process.env.PORT || 5000
const verifyToken = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://service-page.us.auth0.com/.well-known/jwks.json'
  }),
  audience: process.env.UNIQUEID,
  issuer: 'https://service-page.us.auth0.com/',
  algorithms: ['RS256']
});

const dbURI = process.env.DBURI;
// mongodb
mongoose.connect("mongodb+srv://Khulalit:Khulalit@markitdown.ewyfpbw.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser : true, useUnifiedTopology : true})
.then(result=>{
  console.log("Database connected ....")
})
.catch(err => console.log(err));
app.use(cors({
    origin: ['https://markitdownapp.netlify.app']
}))

// auth router attaches /login, /logout, and /callback routes to the baseURL
// use for body parsing
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(verifyToken);
// route
app.get('/rename',(req,res)=>{
    const fid = req.query.fid
    const rename = req.query.rename
    User.update(
        {   
            "files._id" : fid
        },{
            "$set" : {
                "files.$.name" : rename
            }
        }).then(res=>{
            console.log(res)
        }).catch(err=>{
            res.sendStatus(500)
        })
        res.sendStatus(200)
})
app.post('/update',(req,res)=>{
    const fid = req.body.fid
    const uid = req.body.sub
    const file = {
        content : "This is a file new"
    }
    User.update(
    {   
        "files._id" : fid
    },{
        "$set" : {
            "files.$.content" : req.body.content
        }
    }).then(res=>{
        console.log(res)
    })
    res.json({message:"File updated", fid:fid})
    // res.send({message : "/ route"})
})
app.post('/register',(req,res)=>{
    const uid = req.body.sub;
    User.find({userid : uid}).
    then((result)=>{
        if (result.length === 0)
            {
                console.log("no user found")
                const user = new User({
                    userid :  uid,
                    name : req.body.name,
                    email : req.body.email,
                    files : []
                });
                user.save();
                res.json({message : "new user created"})
            }

        else 
            res.json({message : "already user"})
            
        }).
        catch(()=>{
            res.status(500)
        })
});
app.post('/save',(req,res)=>{
    console.log("user" +req.body)
    let fid;
    const file = {
        name : req.body.name,
        content : req.body.content ,
        uid : req.body.uid
    }
    console.log(file)
    User.findOneAndUpdate({
        "userid": file.uid
      },
      {
        "$push": {
          "files": {
            "name": file.name,
            "content": file.content
          }
        }
      },(err,succ)=>{
        if(err){
            console.log(err)
            res.json({status: 500, message : "Something went wrong."})
        }
        else{
            console.log(succ)
            try {
                
                fid = succ.files[succ.files.length-1]._id
                res.json({message:"File saved", fid:fid, error: false})
            } catch (error) {
                res.json({message:"File saved", fid:fid, error:true})
            }
           
        }
    })
    
});
app.get('/delete/:id',(req,res)=>{
    const fid = req.params.id
    console.log(fid)
    const uid = req.user.sub
    console.log(uid)
    User.findOneAndUpdate({
        "userid": uid
      },
      {
        "$pull": {
          "files": {
            "_id" : new ObjectID(fid)
          }
        }
      },(err,succ)=>{
        if(err)
            console.log("error")
        else
            console.log("Deleted")
    })
        res.json({message:"File updated"})
    
});
app.get('/get/:id',(req,res)=>{
    const uid = req.params.id
    console.log(uid)
    User.find({userid : uid}).
    then((result)=>{
        res.json(result)
            
    }).
    catch(()=>{
        res.status(500)
    })
})


app.listen(PORT,()=>{
    console.log("listening at port "+PORT)
});
