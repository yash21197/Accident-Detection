var express = require('express');
var firebase = require('firebase');
var admin = require('firebase-admin');
var bodyparser = require('body-parser');
var urlencodedparser = bodyparser.urlencoded({extended:false});
var app = express();
app.use(express.static('./public'));

var server = app.listen(process.env.PORT || 3000);
console.log('you are listening to the port 3000.');
var io = require('socket.io').listen(server);

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAwVlGXFG4FuQYtUCRXx93i13hjuVg5PX0",
    authDomain: "accidentdetection-449db.firebaseapp.com",
    databaseURL: "https://accidentdetection-449db.firebaseio.com",
    projectId: "accidentdetection-449db",
    storageBucket: "accidentdetection-449db.appspot.com",
    messagingSenderId: "545958048030"
};
firebase.initializeApp(config);
var serviceAccount = require('./serviceaccountkey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://accidentdetection-449db.firebaseio.com'
});

app.get('/', function(req,res){
  res.sendFile(__dirname+'/public/index.html');
});
app.get('/addLocation', function(req,res){
  res.sendFile(__dirname+'/public/location.html');
});

app.post('/pushLocation',urlencodedparser,function(req,res){
  // console.log(req.body);
  var date = req.body['date'];
  firebase.database().ref('/accident_loc/'+date).push(req.body);
  res.json(null);
});


app.post('/login',urlencodedparser,function(req,res){
  firebase.auth().signInWithEmailAndPassword(req.body.emailID, req.body.pswd)
  .then(function(result){
    var user = result.user;
    var emailVerified = user.emailVerified;
    var uid = user.uid;

    var user_ref = firebase.database().ref().child('user_notification').child(uid);
    var ref_est = user_ref.child('emailsendtime');
    var sendtime=1;
    ref_est.once('value',est_snap => {
      var sendtime = parseInt(est_snap.val());
      if(sendtime > 4){
        user.delete().then(function() {
          user_ref.remove();
        }).catch(function(error) {
          // An error happened.
        });
      }else if(!emailVerified){
        sendtime++;
        if(!emailVerified){
          user.sendEmailVerification();
        }
        ref_est.set(sendtime.toString());
      }
    });
    var temp_time=new Date();
    var ust_date = temp_time.getUTCDate();
    var ust_month = (temp_time.getUTCMonth()+1);
    var ust_year = temp_time.getFullYear();
    var ust_hour = temp_time.getUTCHours();
    var ust_min = temp_time.getUTCMinutes();
    var ust_sec = temp_time.getUTCSeconds();
    temp_time = "(ust) " + ust_hour.toString() + ":" + ust_min.toString() + ":" + ust_sec.toString() + " " + ust_year.toString() + "-" + ust_month.toString() + "-" + ust_date.toString();
    user_ref.child('Last_LogIN').set(temp_time);
    res.json(user);
  })
  .catch(function(error) {
      var err = {
        code : 'error',
        msg : error.message
      };
      res.json(err);
  });
});

app.post('/signup',urlencodedparser,function(req,res){
  firebase.auth().createUserWithEmailAndPassword(req.body.emailID, req.body.pswd)
  .then(function(result){
    var user = result.user;
    var emailVerified = user.emailVerified;
    var uid = user.uid;

    var user_ref = firebase.database().ref().child('user_notification').child(uid);
    user_ref.child('notifications').push({
      date : "dd-mm-yyyy",
      time : "hh:mm:ss",
      notifi : "Welcome to Accident_detection..."
    });
    user_ref.child('Hospital_name').set("null");
    user_ref.child('mobile_number').set("none");
    user_ref.child('Lat_Long').set("none,none");
    user_ref.child('emailsendtime').set(1);

    var ref_est = user_ref.child('emailsendtime');
    var sendtime=1;
    user.sendEmailVerification();
    ref_est.set(sendtime.toString());

    var temp_time=new Date();
    var ust_date = temp_time.getUTCDate();
    var ust_month = (temp_time.getUTCMonth()+1);
    var ust_year = temp_time.getFullYear();
    var ust_hour = temp_time.getUTCHours();
    var ust_min = temp_time.getUTCMinutes();
    var ust_sec = temp_time.getUTCSeconds();
    temp_time = "(ust) " + ust_hour.toString() + ":" + ust_min.toString() + ":" + ust_sec.toString() + " " + ust_year.toString() + "-" + ust_month.toString() + "-" + ust_date.toString();
    user_ref.child('Last_LogIN').set(temp_time);
    res.json(user);
  })
  .catch(function(error) {
      var er = {
        code : 'error',
        msg : error.message
      };
      console.log(er);
      res.json(er);
  });
});

app.post('/userprofile',urlencodedparser,function(req,res){
  var user = req.body;

  var uid = user['user[uid]'];
  var displayName = user['user[displayName]'];
  var email = user['user[email]'];

  var dname = null;
  var ueid = null;
  var mobilenumber = null;
  var latlong = null;
  var user_ref = firebase.database().ref().child('user_notification').child(uid);

  user_ref.once('value' , snapshot => {
      var userdata = snapshot.val();
      if(userdata.Hospital_name == "none")
          dname = null;
      else
          dname = userdata.Hospital_name;
      ueid = email;

      mobilenumber = userdata.mobile_number;
      latlong = userdata.Lat_Long;

      if(mobilenumber == "none")
          mobilenumber = null;
      else{
          var tmp_mno = mobilenumber;
          var len = tmp_mno.length;
          tmp_mno = tmp_mno.slice(0, len-10) + "-" + tmp_mno.slice(len-10);
          mobilenumber = tmp_mno;
      }

      if(latlong == "none,none")
          latlong = null;
      else
          latlong = latlong;

      var userdata = {
        dname : dname,
        email : ueid,
        mno : mobilenumber,
        latlong : latlong
      }

      res.json(userdata);
  });
});

app.post('/saveuserdata',urlencodedparser,function(req,res){
  var dname = req.body.name;
  var mno = req.body.mno;
  var latlong = req.body.latlong;
  var user = JSON.parse(req.body.user);

  var uid = user.uid;
  var user_ref = firebase.database().ref().child('user_notification').child(uid);

  var err = {
    code : 'none',
    msg : '',
  }

  if(dname==="" || dname == null){
      dname = "none";
  }

  admin.auth().getUser(user.uid).then(function(userRecord) {
    user_ref.child('Hospital_name').set(dname);
    userRecord.updateProfile({
        displayName: dname
    }).then(function() {
      console.log('name changed');
    }).catch(function(error){
        err.code = 'error';
        err.msg = "Display Name cann't be updated!!!";
    });
  })
  .catch(function(error) {
    // console.log("Error fetching user data:", error);
    err.code = 'error';
    err.msg = "Display Name cann't be updated!!!";
  });

  if(mno===""){
      user_ref.child('mobile_number').set("none");
  }else{
      if(checkmobilenumber(mno)){
          mno = mno.replace("-" , "");
          user_ref.child('mobile_number').set(mno);
      }else{
        err.code = 'error';
        err.msg += '\nmobile number pattern should be +CountryCode-MobileNumber !!!';
      }
  }

  if(latlong == "" || latlong == null){
      latlong="none,none";
      user_ref.child('Lat_Long').set(latlong);
  }else{
      var split_latlong = latlong.split(",");
      if(split_latlong.length==2){
          if(isNaN(split_latlong[0]) || isNaN(split_latlong[1])){
            err.code = 'error';
            err.msg = '\nlatitude and longitude both should be numbers.';
          }else{
              user_ref.child('Lat_Long').set(latlong);
          }
      }else{
        err.code = 'error';
        err.msg = '\ninvalid latitude and longitude formate!';
      }
  }
  res.json(err);
});

app.post('/forgotpswd',urlencodedparser,function(req,res){
  var email = req.body.email;
  var auth = firebase.auth();
  auth.sendPasswordResetEmail(email).then(function() {
    var msg = {
      code : 'alert',
      msg : 'Password Reset Email has been sended to this email address : ' + email
    }
    res.json(msg);
  }).catch(function(error) {
    var err = {
      code : 'error',
      msg : 'your email address is invalid'
    }
    res.json(err);
  });
});

app.post('/resetpswd',urlencodedparser,function(req,res){
  var user = JSON.parse(req.body.user);
  admin.auth().getUser(user.uid).then(function(userRecord) {
    userRecord.updatePassword(req.body.pswd).then(function() {
        var msg = {
          code : 'alert',
          msg : 'Password Updated...'
        }
        console.log("Password Updated...");
    }).catch(function(error) {
      var err = {
        code : 'error',
        msg : error
      }
      res.json(err);
    });
  })
  .catch(function(error) {
    var err = {
      code : 'error',
      msg : 'Password can not be changed!!!'
    };
    res.json(err);
  });
});

app.post('/helpOpt',urlencodedparser,function(req,res){
  var dateref = firebase.database().ref('/accident_loc/'+req.body.date);
  dateref.child(req.body.acc_key).child('hospitals').orderByChild('ref').equalTo(req.body.uid).once('value' , snapshot => {
    var index_hos = snapshot.val();
    for(var key in index_hos){
      if(req.body.help==='1'){
        dateref.child(req.body.acc_key).child('hospitals').child(key).child('help').set(1);
      }else if(req.body.help==='0'){
        dateref.child(req.body.acc_key).child('hospitals').child(key).child('help').remove();
      }
      res.json(null);
    }
  });
});

function checkmobilenumber(mno){
    var pattern = /^[\+]\d{2}[\-]\d{10}$/;
    return pattern.test(mno);
}
var connections = [];

io.sockets.on('connection', function (socket) {
  console.log('A user connected');
  connections.push(socket);

  var user_notifi_ref = null;
  var date_ref = null;
  var hospital_ref = null;

  socket.on('clearNotifi',function(){
    if(user_notifi_ref != null){
      user_notifi_ref.off();
      user_notifi_ref = null;
    }
  });

  socket.on('setDate',function(date){
    if(date_ref!=null)
      date_ref.off();
    date_ref = firebase.database().ref().child("accident_loc").child(date);
  });

  socket.on('getNotifi' , function(uid){
    user_notifi_ref = firebase.database().ref('/user_notification/'+uid+'/notifications');
    user_notifi_ref.on('child_added' , snap_notifi => {
      var notifi = user_notifi_ref.child(snap_notifi.key);
      notifi.once('value' , snapshot => {
        var data = snapshot.val();
        var notifi_date = data.date;
        var notifi_time = data.time;
        var notifi_data = data.notifi;

        var temp = notifi_date.split("-");
        var year = temp[2];
        var month = temp[1];
        var date = temp[0];
        var check_date = year+"/"+month+"/"+date;

        check_date += (' '+notifi_time + ' UTC');
        var date_time_flag=false,show_flag=false;

        temp = notifi_time.split(":");
        var hour = temp[0];
        var min = temp[1];

        if(notifi_date == "dd-mm-yyyy" && notifi_time == "hh:mm:ss"){
          notifi_time = new Date().toLocaleTimeString();
          notifi_date = new Date().toLocaleDateString();
          notifi_date = notifi_date.replace('/','-');
          notifi_date = notifi_date.replace('/','-');
          date_time_flag=false;
          show_flag=true;
        }else if(checkValidTimeDiff(check_date)){
          notifi_time = new Date(check_date).toLocaleTimeString();
          notifi_date = new Date(check_date).toLocaleDateString();
          notifi_date = notifi_date.replace('/','-');
          notifi_date = notifi_date.replace('/','-');
          date_time_flag=true;
          show_flag=true;
        }else{
          show_flag=false;
          notifi.remove();
        }
        var data = {
          show_flag : show_flag,
          date_time_flag : date_time_flag,
          check_date : check_date,
          notifi_date : notifi_date,
          notifi_time : notifi_time,
          notifi_data : notifi_data
        };
        socket.emit('sendNotifi',JSON.stringify(data));
      });
    });
  });

  socket.on('dateExist',function(){
    if(date_ref!=null)
      date_ref.off();
    date_ref.on('value' , snap => {
        if(snap.exists()){
            socket.emit('dateExistRes',true);
            date_ref.off();
        }else{
          socket.emit('dateExistRes',false);
            // console.log("null returns : not exists");
        }
    });
  });

  socket.on('getLocation',function(area,area_status){
    var dateref = date_ref.key;
    if(date_ref!=null)
      date_ref.off();
    date_ref.orderByChild(area_status).equalTo(area).on('child_added' , snapshot => {
        var ch_key = snapshot.key;
        var key_val_ref = date_ref.child(ch_key);
        var lat_ref = key_val_ref.child('latitude');
        var lng_ref = key_val_ref.child('longitude');
        var time_ref = key_val_ref.child('time');
        var url_ref = key_val_ref.child('imgURL');
        var lat,lng,loctime,url;

        lat_ref.once('value' , lat_snap => {
            lng_ref.once('value' , lng_snap => {
                time_ref.once('value' , time_snap => {
                  url_ref.once('value' , url_snap => {
                    lat = lat_snap.val();
                    lng = lng_snap.val();
                    loctime = time_snap.val();
                    url = url_snap.val();
                    socket.emit('sendLocation',lat,lng,loctime,url,ch_key,dateref);
                  });
                });
            });
        });
    });
  });

  socket.on('getAllLocation',function(){
    var dateref = date_ref.key;
    if(date_ref!=null)
      date_ref.off();
    date_ref.on("child_added" , snapshot => {
        var key = snapshot.key;
        var keyval = snapshot.val();
        var lat=keyval.latitude;
        var lng=keyval.longitude;
        var time=keyval.time;
        var url=keyval.imgURL;
        socket.emit('sendAllLocation',lat,lng,url,key,time);
    });
  });

  socket.on('closeInfo',function(){
    if(hospital_ref != null){
      hospital_ref.off();
      hospital_ref = null;
    }
  });

  socket.on('getHospitalInfo',function(key){
    hospital_ref = date_ref.child(key).child('hospitals');
    var state = false;
    hospital_ref.on('value' , snapshot => {
      state = true;
      snapshot.forEach(function(localsnap){
        var child_key = localsnap.key;
        var child_val = localsnap.val().ref;
        firebase.database().ref('/user_notification/'+child_val).once('value',hospital_snap => {
          if(hospital_snap.exists()){
            var hos_name = hospital_snap.val().Hospital_name;
            var hos_mno = hospital_snap.val().mobile_number;
            date_ref.child(key).child('hospitals').child(child_key).child('help').once('value' , helpsnap => {
              var hospital = {
                hos_name : hos_name,
                hos_mno : hos_mno,
                help : helpsnap.val(),
                uid : child_val,
                state : state
              }
              state = false;
              socket.emit('sendHospitalInfo',hospital);
            });
          }
        });
      });
    });
  });

  socket.on('disconnect', function() {
    console.log('A user disconnected');
    connections.splice(connections.indexOf(socket),1);
    if(date_ref!=null){
      date_ref.off();
      date_ref=null;
    }
    if(user_notifi_ref!=null){
      user_notifi_ref.off();
      user_notifi_ref=null;
    }
    if(hospital_ref!=null){
      hospital_ref.off();
      hospital_ref=null;
    }
  });
});

function checkValidTimeDiff(date_time){
    var diff = Math.abs(new Date() - new Date(date_time));
    var minutes = Math.floor((diff/1000)/60);
    if(minutes > 30){
        return false;
    }else{
        return true;
    }
}
