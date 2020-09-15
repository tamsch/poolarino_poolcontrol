const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../config/database');
const nodemailer = require('nodemailer');

const User = require('../../models/user/user');
const UserRights = require('../../models/user/userRights');

//Registrierung eines neuen Benutzers
router.post('/register', (req, res) => {
    console.log('REQ-POST | users.js | /register');
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text = "";


    if(typeof req.body.email === 'undefined' || typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined') {
        return res.json({status: '400', success: false, msg: 'Bad Request - U1'});
    }

    if(!re.test(req.body.email)){
        return res.json({status: '400', success: false, msg: 'Bad Request - U2'});
    }

    if(req.body.password.length < 4) {
        return res.json({status: '400', success: false, msg: 'Bad Request - U3'});
    } 

    User.find({'email': req.body.email}).exec(function(err, user) {
        if(user.length > 0) {
            return res.json({status: '400', success: false, msg: 'Bad Request - U4'});
        } else {
            User.find({'username': req.body.username}).exec(function(err, user) {
                if(user.length > 0) {
                    return res.json({status: '400', success: false, msg: 'Bad Request - U5'});
                } else {
                    //Generate Secret for registration email
                    for (var i = 0; i < 50; i++){
                        text += possible.charAt(Math.floor(Math.random() * possible.length));
                    }

                    if(typeof req.body.name !== 'undefined') {
                        newUser = new User({
                            name: req.body.name,
                            email: req.body.email,
                            username: req.body.username,
                            password: req.body.password,
                            secret: text
                        });
                    } else {
                        newUser = new User({
                            email: req.body.email,
                            username: req.body.username,
                            password: req.body.password,
                            secret: text
                        });
                    }
                
                
                    User.addUser(newUser, (err, user) => {
                        if(err) {
                            return res.json({ status: 400, success: false, msg: 'Registrierung fehlgeschlagen' });
                        } else {
                            newUserRights = new UserRights({
                                userId: user._id
                            })
                
                            newUserRights.save( (err, data) => {
                                if(err) {
                                    console.log(err);
                                    return res.json({ status: 400, success: false, msg: 'Anlegen der Rechte fehlgeschlagen' });
                                } else {
                                    user.set({
                                        userRights: data._id
                                    });
                
                                    user.save(function (err, user) {
                                        if (err){
                                            return res.json({ status: 400, success: false, msg: 'Bad Request - U6'});
                                        } else {
                                            var plain = `
                                            <h4>Deine Registrierung war erfolgreich</h4>
                                            <p>Hallo ${user.username},<p>
                                            <p>um Deine Registrierung abschließend zu bestätigen, klicke bitte auf den folgenden Link:</p>
                                            <p> <a href="http://localhost:3000/users/activate/${user._id}/${user.secret}">Registrierung bestätigen</a></p>
                                            `;

                                            var mail = `
                                            <h4>Deine Registrierung war erfolgreich</h4>
                                            <p>Hallo ${user.username},<p>
                                            <p>um Deine Registrierung abschließend zu bestätigen, klicke bitte auf den folgenden Link:</p>
                                            <p> <a href="http://localhost:3000/users/activate/${user._id}/${user.secret}">Registrierung bestätigen</a></p>
                                            `;

                                            let transporter = nodemailer.createTransport({
                                                host: 'MAILHOST',
                                                port: 465,
                                                secure: true, 
                                                auth: {
                                                    user: 'MAILUSER', 
                                                    pass: 'MAILPASS' 
                                                }
                                            });
                                        
                                            let mailOptions = {
                                                from: 'MAILHOST',
                                                to: user.email,
                                                subject: 'Deine Registrierung',
                                                text: plain,
                                                html: mail
                                            };
                                        
                                            transporter.sendMail(mailOptions, (err, info) => {
                                                if (err) {
                                                    console.log(err)
                                                }


                                            });

                                            let userId = user._id;
                                            return res.json({ status: 200, success: true, msg: 'Registrierung erfolgreich', userId });
                                        }
                                    });
                                }
                            }); 
                        }
                    }); 
                }
            });
            
        }
    })


        

    
});

router.get('/getAll', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    console.log('REQ-GET | users.js | /getAll');
    UserRights.findById(req.user.userRights, (err, userRights) => {
        if(userRights.isAdmin){
            User.find().exec( function (err, users) {
                if (err) {
                    res.status(500).send(err);
                }
                res.json({ users });
            });
        } else {
            return res.status(401).json({success: false});
        }
    })
});

//logout
router.get('/logout', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    console.log('REQ-GET | users.js | /logout');
    User.findById(req.user._id)
    .exec( function (err, user) {

        // console.log(user);

        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        } else {
            if(user && req.user.isLoggedIn) {
                user.set({
                    isLoggedIn: false
                })
                user.save();

                req.logout();

                return res.json({success: true});
            }
            return res.json({success: false});
        }
    })
});

//Authorisierung
router.post('/authenticate', (req, res, next) => {
    console.log('REQ-POST | users.js | /authenticate');

    User.getUserByUsername(req.body.username, (err, user) => {
        if(err) throw err;
        if(!user) {
            return res.json({
                success: false,
                msg: 'User nicht gefunden'
            });
        }

        UserRights.findById(user.userRights, (err, userRights) => {
            if(err){
                return false;
            } else {
                User.comparePassword(req.body.password, user.password, (err, isMatch) => {
                    if(!userRights.isActivated) {
                        return res.json({
                            success: false,
                            msg: 'Der Benutzer ist nicht aktiviert!'
                        });
                    }
        
                    if(err) throw err;
        
                    if(isMatch && user.partnerId){
                        const token = jwt.sign(
                            {
                                data: {
                                    user: {
                                        _id: user._id,
                                        name: user.name,
                                        rights: {
                                            userRights
                                        }                      
                                    } 
                                }
                            }, 
                            config.secret,
                            { 
                                expiresIn: 604800 
                            }
                        ); //1 Week
                            user.set({
                                isLoggedIn: true
                            })
                            user.save();

                            res.json({
                                success: true,
                                token: 'JWT '+token,
                                user: {
                                    id: user._id,
                                    name: user.name,
                                    username: user.username,
                                    email: user.email,
                                    admin: user.isAdmin
                                }
                            });
                        } else if(isMatch && !user.partnerId) {
                            const token = jwt.sign(
                                {
                                    data: {
                                        user: {
                                            _id: user._id,
                                            name: user.name,
                                            rights: {
                                                userRights
                                            }                
                                        } 
                                    }
                                }, 
                                config.secret,
                                { 
                                    expiresIn: 604800 
                                }
                            ); //1 Week
                            
                            user.set({
                                isLoggedIn: true
                            })
                            user.save();

                            res.json({
                                success: true,
                                token: 'JWT '+token,
                                user: {
                                    id: user._id,
                                    name: user.name,
                                    username: user.username,
                                    email: user.email,
                                    admin: user.isAdmin
                                }
                            });
                        }else {
                        return res.json({
                            success: false,
                            msg: 'Falsches Passwort'
                        });
                    }
                });
            }
        });
    });
});

//Profil
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    console.log('REQ-GET | users.js | /profile');
    if(req.user.partnerId) {
        Partner.findById(req.user.partnerId).exec(function (err, partner) {
            return res.json({
                user: {
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    username: req.user.username,
                    partner: partner.name
                }
            });
        })
    } else {
        res.json({
            user: {
                userId: req.user._id,
                name: req.user.name,
                email: req.user.email,
                username: req.user.username,
            }
        });
    }
    
});

//Admin
router.get('/admin', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    console.log('REQ-GET | users.js | /admin');

    res.json({user: {
            name: req.user.name,
            email: req.user.email,
            username: req.user.username,
            isAdmin: req.user.isAdmin
        }
    });
});

//Muss der User sich neu anmelden?
router.get('/checkForRelog', (req, res, next) => {
    console.log('REQ-GET | users.js | /checkForRelog');
    return res.json({success: false});
    User.findById(req.user._id)
    .exec( function (err, user) {

        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if(user.hasToRelog && req.user.isLoggedIn) {
                user.set({
                    hasToRelog: false,
					isLoggedIn: false
                })
                user.save();
                return res.json({success: true});
            } else {
                return res.json({success: false});
            }
            
        }
    });  
});

//Benutername noch verfügbar?
router.get('/checkUsername/:username', (req, res) => {
    console.log('REQ-GET | users.js | /checkUsername');
    User.find({'username': req.params.username}).exec( function (err, user) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if(user.length > 0) {
                return res.json({status: '400', success: false, msg: 'Benutzername bereits vergeben'});
            } else {
                return res.json({status: '200', success: true});
            }
            
        }
    });  
});

//E-Mail-Adresse noch verfügbar?
router.get('/checkEmail/:email', (req, res) => {
    console.log('REQ-GET | users.js | /checkEmail');
    User.find({'email': req.params.email}).exec( function (err, user) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if(user.length > 0) {
                return res.json({status: '400', success: false, msg: 'E-Mail-Adresse bereits vergeben'});
            } else {
                return res.json({status: '200', success: true});
            }
            
        }
    });  
});

//Benutzer aktiviert per E-Mail?
router.get('/validateActivation/:userId', (req, res) => {
    console.log('REQ-GET | users.js | /validateActivation/:userId');    
    UserRights.findOne({'userId': req.params.userId}).exec( function (err, userRights) {
        if (userRights === null || typeof userRights === 'undefined' || userRights.length === 0) {
            return res.json({status: '400', success: false, msg: 'Benutzer nicht gefunden!'});
        } else {
            if(userRights.isActivated === true) {
                return res.json({status: '200', success: true});
            } else {
                return res.json({status: '400', success: false, msg: 'Benutzer noch nicht aktiviert!'});
            }
            
        }
    });  
});

//Benutzeraktivierung per E-Mail
router.get('/activate/:userId/:secret', (req, res) => {
    console.log('REQ-GET | users.js | /activate');
    User.findById({'_id': req.params.userId}).exec( function (err, user) {
        if (typeof user === 'undefined' || user.length === 0) {
            return res.json({status: '400', success: false, msg: 'Bad Request - U7'});
        } else {
            if(user.secret === req.params.secret) {

                user.set({
                    secret: ''
                })

                user.save((err, user) => {
                    if(err) {
                        console.log(err);
                    } else {
                        UserRights.findById({'_id': user.userRights}).exec(function(err, userRights) {
                            userRights.set({
                                isActivated: true
                            })
        
                            userRights.save();
                            return res.json({msg: 'Sie haben Ihren Benutzer erfolgreich freigeschaltet!'});
                        })
                    }
                })
            } else {
                return res.json({status: '400', success: false, msg: 'Bad Request - U7'});
            }
            
        }
    });  
});

// Interne Benutzer laden
router.get('/getInternal', passport.authenticate('jwt', {session:false}), async (req, res) => {
    console.log('REQ-GET | users.js | /getInternal');
    UserRights.findById(req.user.userRights, async (err, userRights) => {
        if(userRights.canAddCustomer || userRights.canEditCustomer || userRights.isAdmin) {

            let users = [];

            const internalUsers = await UserRights.find({isInternal: true});
            for(let num of internalUsers) {
                const user = await User.findById(num.userId).select('name');

                let userHelper = {
                    name: user.name,
                    _id: user._id
                }

                users.push(userHelper);
                if(users.length === internalUsers.length) {
                    return res.json({success: true, users: users});
                }
            }
        } else {
            return res.status(401).json({success: false});
        }
    })
})

module.exports = router;