exports.index = function(req, res){
   console.log("request url--- index: "+req.url);
//   if(req.session.regId != undefined && req.session.regId != null) {
//       res.render('/app/partials' + req.url);
//       console.log("No need for index.html as you're logged in. Sending you to: "+req.url);
//   } else
    {
        res.sendfile(__dirname+"/client/index.html");
   }
   //res.render('app/partials/' + req.params.name);

};

exports.partials = function(req, res) {
   console.log("request url---"+req.url);
   console.log(req.params.name);
   //console.log(__dirname+'/client/app/partials' + req.url;
   res.render('/app/partials' + req.url);
};