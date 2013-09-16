var express     = require('express'),
    mysql       = require('mysql'),
    _           = require('underscore'),
    path        = require('path'),
    http        = require('http')
    , reload    = require('reload')
    , routes    = require('./routes')
    , trojandb  = require('./trojandb');


var clientDir = path.join(__dirname,'client');
var server = null;


var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000)
    app.use(express.favicon())
    app.use(express.logger('dev'))
    app.use(express.bodyParser())
    app.use(express.cookieParser())
    app.use(express.session({secret:'@#$dkjfoue343!'}))
    app.use(express.static(clientDir))
    app.use(app.router)
});

var redirectToMain = function(req,res) {
    res.sendfile(path.join(clientDir, 'index.html'));
}
app.get('/restoreSession/:regId',function(req,res){
    if (req.params.regId != req.session.regId) {
        res.send(500,"Invalid session!");
    }
    var regId = req.params.regId;
    var list = [regId, req.session.l1,req.session.l2,req.session.l3];
    var restoreQuestionCallback = function (list,result) {
        if (result == null) {
            res.send(500,"Something went wrong restoring question!");
        }
        req.session.l1 = list[1];
        req.session.l2 = list[2];
        req.session.l3 = list[3];
        req.session.regId = list[0];
        res.send(200, result);
    }
    var list = [regId, req.session.l1,req.session.l2,req.session.l3]
    trojandb.restoreQuestion(list,restoreQuestionCallback);

});

app.get('/', routes.index);
app.get('/app/partials/:name',routes.partials)

app.put('/recordAnswer', function (req,res) {
    if (req.session.regId != req.body.regId){
        res.send(500,"Invalid submission. Session error!");
        console.log("Inavlid submission ! session error!");
    }
    var list = [req.session.regId, req.session.l1,req.session.l2,req.session.l3,req.body.qid,req.body.answer];
    try {
        trojandb.verifyAndRecordAnswer(list, function(list,result) {
            if (result == null) {
                res.send(500);
            }
            req.session.l1 = list[1];
            req.session.l2 = list[2];
            req.session.l3 = list[3];
            req.session.regId = list[0];
            res.send(200,result);
        });
        //var results = trojandb.runQuery("insert into answers (regId,qId,answer) values (?,?,?)",[regId, req.body.qid,req.body.answer]);
    } catch (err) {
        res.send(500,"Couldn't insert! ");
        console.log("500 - couldn't insert!",err);
    }
});

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

function newRegId() {
    var d  = new Date();
    var n = d.valueOf();
    return n;
}
app.put("/registerUser",function(req,res) {

    var regId = newRegId();
    try {
        trojandb.runQuery("insert into student (name,age,email,password,regId,l2) values (?,?,?,?,?,?)",
                                  [req.body.fullName,req.body.age,req.body.emailAddr,req.body.password,regId,0],
                                  function(results) {
                                       res.send(200,{regId:regId});
                                  });
    } catch(err) {
        res.send(500, "Couldn't insert! "+err);
    }
});
app.post('/login',function(req,res){
    try {
        var processResults  = function (results) {
            if (results.length == 0) {
                res.send(500,"Registration ID doesn't exist!");
            } else if (req.body.password != results[0].password) {
                res.send(500,"Wrong password!");
            } else {
                req.session.regId = req.body.regId;
                req.session.l1 = results[0].l1;
                req.session.l2 = results[0].l2;
                req.session.l3 = results[0].l3;
                res.send(200,{regId:req.body.regId});
            }
        }
        /*if(req.session.regId != undefined && req.session.regId != null) {
            res.send(200,{regId:req.body.regId});
        }*/
        trojandb.runQuery('SELECT password,l1,l2,l3 from student where regId = ?',[req.body.regId], processResults);

    }
    catch(err) {
        res.send(500,"Some error: "+err);
    }
});

app.get('/getQuestions/:level', function (req,res) {
    var level = req.params.level;
    var processResults = function (results) {
        if (results.length == 0 ){
            res.send(500,"Couldn't retrieve any questions!");
        } else {
            res.send(200,results);
        }
    }
    try {
        trojandb.runQuery('SELECT id,level,question,answer_a,answer_b,answer_c,answer_d from questions where level = ?',[level],processResults);
    } catch (err) {
        res.send(500,"Some error! "+err);
    }
})

app.put('/logout',function(req,res){
    req.session.destroy();
    res.send(200);
});
app.get('/results/:regId',function(req,res){
    var regId = req.params.regId;
    if (regId != req.session.regId) {
        res.send(500,"Invalid session");
    }
    var processResults = function (results) {
        if(results == null) {
            res.send(500,"Couldn't retrive results!");
        }
        res.send(200,results);
    }
    try {
        trojandb.getStudentResults(regId,processResults);
    } catch (err) {
        res.send(500,"Something went wrong!",e);
    }
})
app.get('*', routes.index);
server = http.createServer(app);
server.listen(app.get('port'));
console.log("Listening on port: "+app.get('port'));

