const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//exports.addLocation = functions.https.onRequest((req,res) => {
//    const lat = req.query.lat;
//    const lng = req.query.lng;
//    const country = req.query.country;
//    const state = req.query.state;
//    const city = req.query.city;
//    const address = req.query.address;
//    const date = req.query.date;
//    var time = req.query.time;
//    time = time.replace('>','+');
//    time = time.replace('<','-');
//
//    var obj = {
//        latitude: lat,
//        longitude: lng,
//        state: state,
//        city: city,
//        country: country,
//        address: address,
//        date: date,
//        time: time
//    };
//
//    admin.database().ref('/locations_ref').push(obj);
//        .then(snapshot => {
//        res.redirect(303, snapshot.ref);
//    });
//});

//exports.sortLocations = functions.database.ref('/locations_ref/{pushId}')
//    .onCreate(event => {
//    const data = event.data.val();
//    const key = event.params.pushId;
//
//    const lat = data.latitude;
//    const lng = data.longitude;
//    const country = data.country;
//    const state = data.state;
//    const city = data.city;
//    const address = data.address;
//    const date = data.date;
//    const time = data.time;
//
//    var loc_obj = {
//        latitude: lat,
//        longitude: lng,
//        state: state,
//        city: city,
//        country: country,
//        time: time,
//        address: address
//    };
//
//    admin.database().ref('/accident_loc').child(date).push(loc_obj);
//    admin.database().ref('/locations_ref/'+key).remove();
});

exports.sendNotification = functions.database.ref('/accident_loc/{pushId}/{pId}')
    .onCreate(event => {
    const parent_key = event.params.pushId;
    const child_key = event.params.pId;
    const reference = event.data.val();
    const lat = reference.latitude;
    const long = reference.longitude;
    const address = reference.address;
//    admin.database().ref('/accident_loc/'+parent_key+"/"+child_key+"/address").remove();
    var ref_lat = parseFloat(lat.toString().trim());
    var ref_long = parseFloat(long.toString().trim());
    admin.database().ref('/user_notification').once("value", querySnapshot => {
        querySnapshot.forEach(function(locationSnapshot) {
            var loc_obj = locationSnapshot.val();
            var tmp_key = locationSnapshot.key;
            var lat_long = loc_obj.Lat_Long;
            lat_long = lat_long.split(",");
            var tmp_lat = parseFloat((lat_long[0]).toString().trim());
            var tmp_long = parseFloat((lat_long[1]).toString().trim());
            if(!isNaN(tmp_lat) && !isNaN(tmp_long)){
                var a,c,d,earth_radius=6371;
                var d_Lat  = (tmp_lat - ref_lat)*Math.PI/180;
                var d_Long = (tmp_long - ref_long)*Math.PI/180;
                a = Math.sin(d_Lat/2) * Math.sin(d_Lat/2) + Math.cos((ref_lat)*Math.PI/180) * Math.cos((ref_lat)*Math.PI/180) * Math.sin(d_Long/2) *  Math.sin(d_Long/2);
                c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                d = earth_radius * c;
                if(d<=10){
                    admin.database().ref('/accident_loc').child(parent_key).child(child_key).child('hospitals').push({ref : tmp_key});
                    var addr = "There is an accident at" + '</br>' + address;
                    var day = new Date().getUTCDate().toString();
                    var month = (new Date().getUTCMonth()+1).toString();
                    var year = new Date().getUTCFullYear().toString();
                    if(day.length == 1)
                        day = "0"+day+"";
                    if(month.length == 1)
                        month = "0"+month+"";
                    var today = day+"-"+month+"-"+year;
                    var time = new Date();
                    var hour = time.getUTCHours().toString();
                    var min = time.getUTCMinutes().toString();
                    var sec = time.getUTCSeconds().toString();
                    if(hour.length==1){
                        hour="0"+hour;
                    }
                    if(min.length==1){
                        min="0"+min;
                    }
                    if(sec.length==1){
                        sec="0"+sec;
                    }
                    time = hour+":"+min+":"+sec;
                    var notifi_obj = {
                        date : today,
                        time : time,
                        notifi : addr
                    };
                    admin.database().ref('/user_notification').child(tmp_key).child('notifications').push(notifi_obj);
                }
            }
        });
    });
});
