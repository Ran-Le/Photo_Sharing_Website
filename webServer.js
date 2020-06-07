"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
var fs = require("fs");

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
// app.get('/user/list', function (request, response) {
//     response.status(200).send(cs142models.userListModel());
// });


app.get('/user/list', function (request, response) {
    if(request.session.login_name && request.session.user_id)
    {
        let usersList = [];
        User.find(function(err,users){
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            for(let i = 0; i < users.length; i++)
            {
                let indUser = {
                    _id: users[i]._id,
                    first_name: users[i].first_name,
                    last_name: users[i].last_name,
                    latest_act: users[i].latest_act
                }
                usersList.push(indUser);
            }
            // console.log(usersList);
            response.status(200).send(usersList);
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});






/*
 * URL /user/:id - Return the information for User (id)
 */
// app.get('/user/:id', function (request, response) {
//     var id = request.params.id;
//     var user = cs142models.userModel(id);
//     if (user === null) {
//         console.log('User with _id:' + id + ' not found.');
//         response.status(400).send('Not found');
//         return;
//     }
//     response.status(200).send(user);
// });

app.get('/user/:id', function (request, response) {
    if(request.session.login_name && request.session.user_id)
    {
        var id = request.params.id;
        // console.log(id);
        User.findOne({_id: id}, function(err, user){
            if(err)
            {
                console.log('User with _id:' + id + ' not found.');
                response.status(400).send('Not found');
            }
            else
            {
                if(user === null)
                {
                    response.status(400).send('User not found');
                }
                else
                {
                    let indUser = JSON.parse(JSON.stringify(user));
                    let indUser_cleanUp = {
                        _id: indUser._id,
                        first_name: indUser.first_name,
                        last_name: indUser.last_name,
                        location: indUser.location,
                        description: indUser.description,
                        occupation: indUser.occupation,
                        mentions: indUser.mentions
                    }
                    response.status(200).send(indUser_cleanUp);
                }

            }
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});



/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
// app.get('/photosOfUser/:id', function (request, response) {
//     var id = request.params.id;
//     var photos = cs142models.photoOfUserModel(id);
//     if (photos.length === 0) {
//         console.log('Photos for user with _id:' + id + ' not found.');
//         response.status(400).send('Not found');
//         return;
//     }
//     response.status(200).send(photos);
// });

app.get('/photosOfUser/:id', function (request, response) {
    if(request.session.login_name && request.session.user_id)
    {
        var id = request.params.id;
        Photo.find({user_id: id}, function(err, photos){
            if(err)
            {
                console.log('User with _id:' + id + ' not found.');
                response.status(400).send('Not found');
            }
            else if(photos.length === 0)
            {
                console.log('Photos for user with _id:' + id + ' not found.');
                response.status(400).send('Not found');
            }
            else
            {
                let indPhotos = JSON.parse(JSON.stringify(photos));
                let photoList = [];

                async.each(indPhotos, function(photo, callback){
                    let comments = photo.comments;

                    async.each(comments, function(comment, callback){
                        let id = comment.user_id;
                        User.findOne({_id: id}, function(err, user){
                            if(err)
                            {
                                console.log('User with _id:' + id + ' not found.');
                                response.status(400).send('Not found');
                            }
                            else
                            {
                                let indUser = JSON.parse(JSON.stringify(user));
                                let indUser_cleanUp = {
                                    _id: indUser._id,
                                    first_name: indUser.first_name,
                                    last_name: indUser.last_name
                                };
                                comment.user = indUser_cleanUp;
                                delete comment.user_id;
                                // console.log(comment);
                                callback();
                            }
                        });

                    }, function(err){
                        if(err)
                        {
                            console.log('A comment failed to process');
                        }
                        else
                        {
                            photo.comments = comments;
                            delete photo.__v;
                            photoList.push(photo);
                            callback();
                        }
                    });

                }, function(err){
                    if(err)
                    {
                        console.log('A photo failed to process');
                    }
                    else
                    {
                        // console.log(photoList);
                        response.status(200).send(photoList);
                    }
                });

            }
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});

app.post("/admin/login",function(request,response){
    var myName = request.body.login_name;
    User.findOne({login_name: myName}, function(err,user){
        if(err)
        {
            response.status(400).send('Not found');
        }
        else
        {
            if(user)
            {

                let indUser = JSON.parse(JSON.stringify(user));
                if(indUser.password === request.body.password)
                {
                    request.session.user_id = indUser._id;
                    request.session.login_name = indUser.login_name;
                    user.latest_act = "Logged in";
                    user.save();
                    response.status(200).send(indUser);
                }
                else
                {
                    response.status(400).send("Wrong password");
                }
            }
            else
            {
                response.status(400).send("User not found");
            }

        }
    });

});

app.post("/admin/logout", function(request, response) {
    if (request.session.login_name && request.session.user_id) {

        User.findOne({login_name: request.session.login_name}, function(err,user){
            if(err)
            {
                response.status(400).send('Not found');
            }
            else
            {
                if(user)
                {
                        user.latest_act = "Logged out";
                        user.save();
                }
                else
                {
                    response.status(400).send("User not found");
                }
            }
        });

        delete request.session["login_name"];
        delete request.session["user_id"];
        request.session.destroy(function(err) {
            response.status(400).send(JSON.stringify(err));
        });
        response.status(200).send("Successfully Logout");
    } 
    else 
    {
        response.status(400).send("Logout Failed");
    }
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
    if (request.session.login_name && request.session.user_id) {
        if (request.body.comment === "") {
          response.status(400).send("Invalid comment");
          return;
        }

        User.findOne({login_name: request.session.login_name}, function(err,user){
            if(err)
            {
                response.status(400).send('Not found');
            }
            else
            {
                if(user)
                {
                        user.latest_act = "Added a comment";
                        user.save();
                }
                else
                {
                    response.status(400).send("User not found");
                }
            }
        });

        var myPhotoId = request.params.photo_id;
        Photo.findOne({_id: myPhotoId}, function(err,photo){
            if(err)
            {
                response.status(400).send('Not found');
            }
            else
            {
                if(photo)
                {
                    let newComment = {
                      comment: request.body.comment,
                      date_time: Date.now(),
                      user_id: request.session.user_id
                    };

                    if (photo.comments.length) {
                        photo.comments = photo.comments.concat([newComment]);
                    } 
                    else 
                    {
                        photo.comments = [newComment];
                    }
                    photo.save();
                    response.status(200).send("Comments Updated");
                }
                else
                {
                    response.status(400).send("Photo not found");
                }

            }
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});

app.post("/photos/new", function(request, response) {
    if (request.session.login_name && request.session.user_id) {
        processFormBody(request, response, function(err) {
            if (err || !request.file) {
                response.status(400).send(JSON.stringify(err));
                return;
            }



            var timestamp = new Date().valueOf();
            var filename = "U" + String(timestamp) + request.file.originalname;

        User.findOne({login_name: request.session.login_name}, function(err,user){
            if(err)
            {
                response.status(400).send('Not found');
            }
            else
            {
                if(user)
                {
                        user.latest_act = filename;
                        user.save();
                }
                else
                {
                    response.status(400).send("User not found");
                }
            }
        });

            fs.writeFile("./images/" + filename, request.file.buffer, function(err) {
                if(err)
                {
                    response.status(400).send(JSON.stringify(err));
                }
                else
                {
                    Photo.create(
                        {
                            file_name: filename,
                            date_time: timestamp,
                            user_id: request.session.user_id,
                            comments: []
                        },
                        err=>
                        {
                            if(err)
                            {
                                response.status(400).send(JSON.stringify(err));
                            }
                            else
                            {
                                response.status(200).send("Upload photo success");
                            }
                        }
                    );
                    
                }
            });
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});

app.post("/user", function(request, response) {
    if (request.body.login_name) {

        User.findOne({ login_name: request.body.login_name }, function(err, user){
            if(err)
            {
                response.status(400).send(JSON.stringify(err));
            }
            else
            {
                if(user === null)
                {
                    if (request.body.first_name !== "" && request.body.last_name !== "" && request.body.password !== "") 
                    {
                        User.create({
                            first_name: request.body.first_name,
                            last_name: request.body.last_name,
                            location: request.body.location,
                            description: request.body.description,
                            occupation: request.body.occupation,
                            login_name: request.body.login_name,
                            password: request.body.password,
                            latest_act: "Registered as a user"
                            },
                            err=>
                            {
                                if(err)
                                {
                                    response.status(400).send(JSON.stringify(err));
                                }
                                else
                                {
                                    response.status(200).send("Create user success");
                                }
                            }
                        );
                    }
                    else 
                    {
                        response.status(400).send("Missing information");
                    }
                }
                else
                {
                    response.status(400).send("Exist user name");
                }
            }
        });

    }
});


app.post("/mentionsOfPhoto/:photo_id", function(request, response) {
    if (request.session.login_name && request.session.user_id) {

        var myPhotoId = request.params.photo_id;
        var myUser = request.body.mentionedUser;
        User.findOne({_id: myUser}, function(err,user){
            if(err)
            {
                response.status(400).send('Not found');
            }
            else
            {
                if(user)
                {
                    // console.log(user.mentions);
                    if (user.mentions.length) {
                        user.mentions = user.mentions.concat([myPhotoId]);
                    } 
                    else 
                    {
                        user.mentions = [myPhotoId];
                    }
                    user.save();
                    response.status(200).send("Mentions Updated");
                }
                else
                {
                    response.status(400).send("User not found");
                }

            }
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});

// get photo and owner with provided photo id
app.get("/getMentionedPhotos/:photo_id", function(request, response) {
    if (request.session.login_name && request.session.user_id) {

        var myPhotoId = request.params.photo_id;
        // console.log(myPhotoId);
        Photo.findOne({_id: myPhotoId}, function(err,photo){
            if(err)
            {
                response.status(400).send('Not found');
            }
            else
            {
                // console.log(photo);
                if(photo)
                {
                    // console.log(photo.user_id);
                    User.findOne({_id: photo.user_id}, function(err,user){

                        // console.log(user);
                        if(err)
                        {
                            response.status(400).send('Not found');
                        }
                        else
                        {
                            if(user)
                            {
                                photo.owner = user;
                                let curPhoto = {photo:photo,owner:user};
                                // console.log(photo);
                                response.status(200).send(JSON.stringify(curPhoto));
                            }
                            else
                            {
                                response.status(400).send("User not found");
                            }

                        }
                    });
                }
                else
                {
                    response.status(400).send("Photo not found");
                }

            }
        });
    }
    else
    {
        response.status(401).send("Unauthorized");
    }
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


