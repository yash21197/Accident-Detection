function scrollHorizontally(e) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    document.getElementById('mcs-horizontal-example').scrollLeft -= (delta*20); // Multiplied by 40
    e.preventDefault();
}

var mobilenumber="none",current_user=null,signin_status=false,allowness=false,accountbtnclick=false;
var unsubscribe = null;
var latlong="none,none",displayName="null",email="null",emailVerified=false,photoURL="null",isAnonymous=false,uid="null",providerData="null";
var user_ref=null,user_notifi_ref=null;

var secondtheam = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},
{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},
{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];

var firsttheam = [{"featureType": "all","elementType": "all","stylers":[{"visibility": "on"}]},
{"featureType": "all","elementType": "geometry.fill","stylers":[{"weight": "2.00"}]},
{"featureType": "all","elementType": "geometry.stroke","stylers":[{"color": "#9c9c9c"}]},
{"featureType": "all","elementType": "labels.text","stylers":[{"visibility": "on"}]},
{"featureType": "landscape","elementType": "all","stylers":[{"color": "#f2f2f2"}]},
{"featureType": "landscape","elementType": "geometry.fill","stylers":[{"color": "#ffffff"}]},
{"featureType": "landscape.man_made","elementType": "geometry.fill","stylers":[{"color": "#ffffff"}]},
{"featureType": "poi","elementType": "all","stylers":[{"visibility": "on"}]},
{"featureType": "road","elementType": "all","stylers":[{"saturation": -100},{"lightness": 45}]},
{"featureType": "road","elementType": "geometry.fill","stylers":[{"color": "#eeeeee"}]},
{"featureType": "road","elementType": "labels.text.fill","stylers":[{"color": "#7b7b7b"}]},
{"featureType": "road","elementType": "labels.text.stroke","stylers":[{"color": "#ffffff"}]},
{"featureType": "road.highway","elementType": "all","stylers":[{"visibility": "simplified"}]},
{"featureType": "road.arterial","elementType": "labels.icon","stylers":[{"visibility": "on"}]},
{"featureType": "transit","elementType": "all","stylers":[{"visibility": "on"}]},
{"featureType": "water","elementType": "all","stylers":[{"color": "#46bcec"},{"visibility": "on"}]},
{"featureType": "water","elementType": "geometry.fill","stylers":[{"color": "#c8d7d4"}]},
{"featureType": "water","elementType": "labels.text.fill","stylers":[{"color": "#070707"}]},
{"featureType": "water","elementType": "labels.text.stroke","stylers":[{"color": "#ffffff"}]}];

var mapstyle = firsttheam;

var map=null;
var center_lat=0 , center_lng=0 , earth_center = null;
var user_lat , user_lng , user_pos_marker=null , user_location = null , watchID = null , old_lat = NaN, old_lng = NaN , only_user = true;

var current_loc_interval = null;

var iwindow;
var markerCluster = null , nearest_markers = [] , marker_interval = [] , notification_interval = [];

var user_ip = null , traced_location = null;
var geocoder;
var labelcounter=0;

var infowindow = [];
var userselecteddate;
var lastfunction = null;

var country="",state="",city="";
var notificationnumber=0;

var lasttimeframe = "DAY";
var timeframe=lasttimeframe;
var imgpath = {imagePath:'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'};

var pointer=0;
var istoday = true;
var drowcircle = null;

var inoutdisplay = false;

var marker_date=null;

function initMap() {
    earth_center = new google.maps.LatLng(center_lat,center_lng);
    var mapProp= {
        center:earth_center,
        zoom:2,
        minZoom:2,
        maxZoom:22,
        styles: mapstyle,
        panControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        rotateControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        fullscreenControl: false,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL , position: google.maps.ControlPosition.RIGHT_CENTER},
    };

    map=new google.maps.Map(document.getElementById("googlemap"),mapProp);
    markerCluster = new MarkerClusterer(map, [] ,imgpath);
    setmaplisteners();
}

function removeSocketListener(){
  socket.off('dateExistRes');
  socket.off('sendAllLocation');
  socket.off('sendLocation');
}

function clearnotifiwindow(){
  socket.emit('clearNotifi');
  socket.off('sendNotifi');
    var i;
    for(i=0;i<pointer;i++){
        document.getElementById('data'+i).style.display = "none";
        clearInterval(notification_interval[i]);
    }
    pointer=0;
    notification_interval=[];
    notificationnumber = 0;
    document.getElementById('number').innerText = notificationnumber;
}

function addnotificationlistener(){
  socket.emit('getNotifi',current_user.uid);
  // socket.off('sendNotifi');
  socket.on('sendNotifi',function(notifi){
    notifi = JSON.parse(notifi);
    if(notifi.show_flag){
      var content = '<div class="noti_da_ti">' + 'Date : ' + notifi.notifi_date + '</br>' + 'Time : ' + notifi.notifi_time + '</br>' + '<div id="remainingtime' + pointer + '">' + "Remaining Time : Loading..." + '</div>' + '</div>' + '<div class="noti_data">' + notifi.notifi_data + '</div>';
      pushnotification(content , notifi.check_date , notifi.date_time_flag);
    }
  });
}

function pushnotification(content , date_time , flag){

    document.getElementById('notificationaudio').play();
    notificationnumber++;
    var app = '<div class="data" id="data' + pointer + '">' + '<img id="closeinfobtn" src="./assets/closebtn.png" onclick="closeinfo(' + pointer + ')">' + content + '</div>';
    $(app).insertAfter('#dataindex');
    document.getElementById("mcs-horizontal-example").scrollLeft = 0;
    document.getElementById('number').innerText = notificationnumber;

    if(flag){
        var diff = Math.abs(new Date() - new Date(date_time));
        var minutes = Math.floor((diff/1000)/60);
        document.getElementById('remainingtime'+pointer).innerText = "Remaining Time : " + (30 - minutes) + " minutes";
        set_notification_timelistener(date_time , pointer , 30-minutes);
    }else{
        document.getElementById('remainingtime'+pointer).innerText = "Remaining Time : " + "no limits";
    }
    pointer++;
}

function set_notification_timelistener(date_time , id , diff){

    var set_int = setInterval(function(){
        diff--;
        document.getElementById('remainingtime'+id).innerText = "Remaining Time : " + diff + " minutes";
        var retval = checkValidTimeDiff(date_time,id);
        if(!retval){
            clearInterval(set_int);
            // console.log("remove notification");
            document.getElementById('data'+id).style.display = "none";
        }
    },60000);
    notification_interval[id] = set_int;
}

function set_marker_timelistener(date_time , key , status){
    var set_int = setInterval(function(){
        var retval = checkValidTimeDiff(date_time);
        if(!retval){
            // console.log("remove marker");
            var tmp_marker = nearest_markers[key];
            markerCluster.removeMarker(tmp_marker,false);
            if(markerCluster.getMarkers().length == 0){
                only_user = true;
                if(status!=false){
                    setuserpos(only_user,"./assets/Button-Blank-Red-icon (1).png");
                }
            }
            delete nearest_markers[key];
            clearInterval(set_int);
        }
    },60000);
    marker_interval[key] = set_int;
}

function checkValidTimeDiff(date_time,id){
    var diff = Math.abs(new Date() - new Date(date_time));
    var minutes = Math.floor((diff/1000)/60);

    if(minutes > 30){
        return false;
    }else{
        if(id != undefined){
            document.getElementById('remainingtime'+id).innerText = "Remaining Time : " + (30-diff) + " minutes";
        }
        return true;
    }
}

function closeinfo(id){
    document.getElementById('data'+id).style.display = "none";
}

var addLocation = function(lat,lng,url,ch_key,marker_time){
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        key: ch_key,
        title: ''+labelcounter+'',
        optimized: !isIE,
        icon: './assets/car-collision (2).png',
        lat: lat,
        lng: lng,
        time: marker_time,
        imgURL: url
    });
    nearest_markers[ch_key] = marker;
    labelcounter++;
    markerCluster.addMarker(marker,false);
    iwindow = new google.maps.InfoWindow;
    var content = '<div id="title">' + "Marker Title : " + marker.title + '</div>' + '<div>'+
        '<span id="zoom" onclick="markerzoom(\'' + marker.getPosition() + '\')">' + 'Zoom' + '</span>' +
        '<span>' + '&nbsp; | &nbsp;' + '</span>' +
        '<span id="moreinfo" onclick="markerinfo(\'' + marker.key + '\')">' + ' moreInfo' + '</span>' + '</div>';
    iwindow.setContent(content);
    google.maps.event.addListener(marker,'click', (function(marker , iwindow){
        return function() {
            for(var i=0;i<infowindow.length;i++){
                if(i!=marker.title){
                    infowindow[i].close();
                }
            }
            iwindow.open(map,marker);
        };
    })(marker,iwindow));
    infowindow[marker.title] = iwindow;
};

//  initializing map


// starting of searhing accident zones

function rad(x){
    return x*Math.PI/180;
}

function removeclust(){
    if(markerCluster != null){
        markerCluster.clearMarkers();
        markerCluster.repaint();
    }
    if(drowcircle != null){
        google.maps.event.clearListeners(drowcircle, 'click');
        drowcircle.setMap(null);
        drowcircle = null;
    }
    if(user_pos_marker != null)
        user_pos_marker.setMap(null);
    for(var key in marker_interval){
        clearInterval(marker_interval[key]);
        // console.log('key is :' + key + ' and value is : '+ marker_interval[key])
    }
    infowindow = [];
    nearest_markers = [];
    marker_interval = [];
    labelcounter=0;

    old_lat=NaN;
    old_lng=NaN;
}

function showallplaces(){
    lastfunction = showallplaces;
    user_lat = 0;
    user_lng = 0;
    socket.emit('dateExist');
    removeSocketListener();
    socket.on('dateExistRes',function(res){
      if(res){
        removeSocketListener();
        socket.emit('getAllLocation');
        socket.on('sendAllLocation',function(lat,lng,url,key,time){
          addLocation(lat,lng,url,key,time);
        });
      }else{
        swal("This date data does not exist.");
      }
    });
}

function search_accident_places(area,area_status,status){
    socket.emit('dateExist');
    removeSocketListener();
    socket.on('dateExistRes',function(res){
      if(res){
        removeSocketListener();
        search_child(area,area_status,status);
      }else{
        only_user = true;
        if(status!=false){
            setuserpos(only_user,"./assets/Button-Blank-Red-icon (1).png");
        }
      }
    });
}

function setuserpos(user_status,icon){
    if(user_pos_marker!=null){
        user_pos_marker.setMap(null);
        // console.log("remove");
    }
    if(icon==undefined){
        user_pos_marker = new google.maps.Marker({
            position: user_location
        });
    }else{
        user_pos_marker = new google.maps.Marker({
            position: user_location,
            icon: icon,
        });
    }
    only_user = user_status;
    if(only_user){
        user_pos_marker.setMap(map);
        // console.log("enter");
        setinfowindow(user_pos_marker);
        google.maps.event.addListener(user_pos_marker, 'click', function(event){
            map.setCenter(user_pos_marker.getPosition());
            map.setZoom(map.getZoom()+2);
        });
    }
}

function search_child(area,area_status,display_status){
    only_user = true;
    if(display_status != false){
        setuserpos(only_user,"./assets/Button-Blank-Red-icon (1).png");
    }
    socket.emit('getLocation',area,area_status);
    removeSocketListener();
    socket.on('sendLocation',function(lat,lng,loctime,url,ch_key,dateref){
      var date_select = (dateref).toString();
      var temp = date_select.split("-");
      var date_time = temp[2] + "/" + temp[1] + "/" + temp[0];
      date_time += (' ' + loctime);

      if(display_status == true){
          if(istoday){
              var retval = checkValidTimeDiff(date_time);
              if(retval){
                  document.getElementById('beepaudio').play();
                  addLocation(lat,lng,url,ch_key,loctime);
                  set_marker_timelistener(date_time , ch_key);
                  only_user=false;
                  setuserpos(only_user,"./assets/Button-Blank-Red-icon (1).png");
              }
          }else{
              addLocation(lat,lng,url,ch_key,loctime);
              only_user=false;
              setuserpos(only_user,"./assets/Button-Blank-Red-icon (1).png");
          }
      }else{
          if(finddistance(user_lat,user_lng,lat,lng)<=100){
              if(istoday){
                  var retval = checkValidTimeDiff(date_time);
                  if(retval){
                      document.getElementById('beepaudio').play();
                      addLocation(lat,lng,url,ch_key,loctime);
                      set_marker_timelistener(date_time , ch_key , false);
                      only_user=false;
                  }
              }else{
                  addLocation(lat,lng,url,ch_key,loctime);
                  only_user=false;
              }
          }
      }
    });
}

function finddistance(c_lat , c_lng , m_lat , m_lng){
    var a,c,d,earth_radius=6371;
    var d_Lat  = rad(m_lat - c_lat);
    var d_Long = rad(m_lng - c_lng);
    a = Math.sin(d_Lat/2) * Math.sin(d_Lat/2) + Math.cos(rad(c_lat)) * Math.cos(rad(c_lat)) * Math.sin(d_Long/2) * Math.sin(d_Long/2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    d = earth_radius * c;
    return d;
}

function markerinfo(key){
  $('#helpbtn').val("Send Help");
    var title = nearest_markers[key].title;
    var lat = nearest_markers[key].lat;
    var lng = nearest_markers[key].lng;
    var time = nearest_markers[key].time;
    infowindow[title].close();
    var modal = document.getElementById('myModal');
    var modalImg = document.getElementById("img01");
    var caption_title = document.getElementById("caption_title");
    var caption_lat = document.getElementById("caption_lat");
    var caption_lng = document.getElementById("caption_lng");
    var caption_add = document.getElementById("caption_add");
    var caption_time = document.getElementById("caption_time");
    modal.style.display = "block";
    modalImg.src = nearest_markers[key].imgURL;
    modalImg.onload = function() {
        caption_title.innerHTML = "Marker Title : " + title;
        caption_lat.innerHTML = "Latitude : " + lat;
        caption_lng.innerHTML = "Longitude : " + lng;

        socket.emit('getHospitalInfo',key);
        socket.off('sendHospitalInfo');
        socket.on('sendHospitalInfo',function(hospital){
          if(hospital.state==true){
            document.getElementById('horn').innerHTML = "Help Or Notification Sended :";
          }
          document.getElementById('horn').innerHTML = document.getElementById('horn').innerHTML + '<br/>' + hospital.hos_name + " : " + hospital.hos_mno + " : ";
          if(hospital.help){
            if(hospital.uid===current_user.uid){
              $('#helpbtn').val("Denie Help");
            }
            document.getElementById('horn').innerHTML = document.getElementById('horn').innerHTML + "Help Sended.";
          }else{
            document.getElementById('horn').innerHTML = document.getElementById('horn').innerHTML + "Notification Sended.";
          }
        });

        $('#helpbtn').on({
            click: function(){
                if(signin_status && !allowness){
                    swal("Please verify the email address first and login again...\nUntil you verify email, you cannot use all features.");
                    return;
                }
                if(!signin_status){
                    swal("Please login first.");
                    return;
                }
                if($('#helpbtn').val()=="Send Help"){
                  $.ajax({
                    type : 'POST',
                    url : '/helpOpt',
                    data : {
                      help : '1',
                      date : marker_date,
                      acc_key : key,
                      uid : current_user.uid
                    },
                    success : function(data){
                      $('#helpbtn').val("Denie Help");
                    }
                  });
                }else{
                  $.ajax({
                    type : 'POST',
                    url : '/helpOpt',
                    data : {
                      help : '0',
                      date : marker_date,
                      acc_key : key,
                      uid : current_user.uid
                    },
                    success : function(data){
                      $('#helpbtn').val("Send Help");
                    }
                  });
                }
            }
        });

        geocoder.geocode({ 'latLng': new google.maps.LatLng(lat,lng) }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    add = results[0].formatted_address;
                    caption_add.innerHTML = "Address : " + add;
                }
            }
        });
        caption_time.innerHTML = "Local Time : " + time;

        // send help even if not range so add that hospital in accident hospital list
        var date_select = (marker_date).toString();
        var temp = date_select.split("-");
        var date_time = temp[2] + "/" + temp[1] + "/" + temp[0];
        date_time += (' ' + time);

        if(checkValidTimeDiff(date_time)){
            document.getElementById('helpbtn').style.display = "block";
        }else{
            document.getElementById('helpbtn').style.display = "none";
        }
    }

    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      socket.off('sendHospitalInfo');
      socket.emit('closeInfo');
        modal.style.display = "none";
        document.getElementById('horn').innerHTML = "Help Or Notification Sended :";
        $('#helpbtn').off();
    }

}

function markerzoom(marker_pos){
    console.log("zoom clicked");
    marker_pos = marker_pos.slice(1, marker_pos.length-1);
    var res = marker_pos.split(",");
    console.log(res);
    map.setCenter(new google.maps.LatLng(res[0],res[1]));
    map.setZoom(map.getZoom()+2);
}

// ending of searhing accident zones

// starting of placing marker and infowindow on map

function setinfowindow(marker,info_status){
    // console.log("setinfowin");
    if(only_user == true){
        iwindow = new google.maps.InfoWindow;
        google.maps.event.addListener(marker,'mouseover',function() {
            if(info_status == false){
                iwindow.setContent("Click to Zoom.");
            }else{
                iwindow.setContent("There is no accidents." + "<br>" + "Click to Zoom.");
            }
            iwindow.open(map,marker);
        });
        google.maps.event.addListener(marker, 'mouseout', function(){
            iwindow.close();
        });
    }
}

var clicklocation;

function clickonmap(location){
    clicklocation = location;
    placeMarker();
}

function placeMarker() {

    lastfunction = placeMarker;

    map.setZoom(2);
    map.setCenter(earth_center);

    if(watchID)
        navigator.geolocation.clearWatch(watchID);
    watchID = null;

    if(current_loc_interval != null)
        clearInterval(current_loc_interval);

    removeclust();

    // console.log("doubleclickmarker");

    if(user_pos_marker != null)
        user_pos_marker.setMap(null);

    user_lat=clicklocation.lat();
    user_lng=clicklocation.lng();

    user_location = new google.maps.LatLng(user_lat,user_lng);
    user_pos_marker = new google.maps.Marker({position: user_location});

    geocoder.geocode({ 'latLng': user_location }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var addr = results[0].address_components[i];
                    if (addr.types[0] == 'country')
                        country = addr.long_name;
                     else if (addr.types[0] == ['administrative_area_level_1'])
                        state = addr.long_name;
                    else if (addr.types[0] == ['locality'])
                        city = addr.long_name;
                }
                var box_add = state + ", " + country;
                $('#pac-input').val(box_add);
                search_accident_places(state , "state" , true);
            }else{
                $('#pac-input').val("cannot find address.");
                // console.log("No reverse geocode results.")
            }
        }else{
            $('#pac-input').val("cannot find address.");
            // console.log("Geocoder failed: " + status)
        }
    });
}

// ending of placing marker and infowindow on map

//  starting of search box methods

function initializeAutocomplete(id) {
    $('#'+id).val("");
    var element = document.getElementById(id);
    if (element) {
        var autocomplete = new google.maps.places.Autocomplete(element, { types: ['geocode'] });
        google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
    }
}

var place;
function onPlaceChanged() {
    place = this.getPlace();
    placechanged();
}

function placechanged(){
    lastfunction = placechanged;
    // console.log("search");
    map.setZoom(2);
    map.setCenter(earth_center);
    removeclust();
    user_lat = place.geometry.location.lat();
    user_lng = place.geometry.location.lng();
    if(current_loc_interval != null)
        clearInterval(current_loc_interval);
    if(watchID)
        navigator.geolocation.clearWatch(watchID);
    watchID = null;
    if(user_pos_marker != null)
        user_pos_marker.setMap(null);
    user_location = new google.maps.LatLng(user_lat,user_lng);
    user_pos_marker = new google.maps.Marker({position:user_location});
    var user_add = $('#pac-input').val();
    geocoder.geocode({ 'latLng': user_location }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK){
            if (results[0]){
                for (var i = 0; i < results[0].address_components.length; i++) {
                    var addr = results[0].address_components[i];
                    if (addr.types[0] == 'country'){
                        country = addr.long_name;
                    }else if (addr.types[0] == ['administrative_area_level_1']){
                        state = addr.long_name;
                    }else if (addr.types[0] == ['locality']){
                        city = addr.long_name;
                    }
                }
                if(user_add.indexOf(city) >= 0){
                    search_accident_places(city,"city",true);
                }else if(user_add.indexOf(state) >= 0){
                    search_accident_places(state,"state",true);
                }else if(user_add.indexOf(country) >= 0){
                    search_accident_places(country,"country",true);
                }
            }else{
                $('#pac-input').val("cannot find address.");
                console.log("No reverse geocode results.")
            }
        }else{
            $('#pac-input').val("cannot find address.");
            console.log("Geocoder failed: " + status)
        }
    });
}
//  ending of search box methods


//  tracking user start

function drowCircleOnMap(icon){
    var x=user_lat,y=user_lng;
    drowcircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.1,
        center: {lat: x, lng: y},
        radius: 10000
    });

    drowcircle.setMap(map);

    user_pos_marker = new google.maps.Marker({
        position: user_location,
        icon: icon,
    });

    user_pos_marker.setMap(map);
    setinfowindow(user_pos_marker,false);

    google.maps.event.addListener(user_pos_marker, 'click', function(event){
        map.setCenter(user_pos_marker.getPosition());
        map.setZoom(map.getZoom()+2);
    });

    google.maps.event.addListener(drowcircle, 'click', function (ev) {
        google.maps.event.trigger(map, 'click');
    });
}

function success(position){
    // console.log("success");
    var googleLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    user_lat = googleLatLng.lat();
    user_lng = googleLatLng.lng();
    if(map.getZoom() < 12){
        map.setCenter(user_location);
        map.setZoom(12);
    }
    if(isNaN(old_lat) && isNaN(old_lng)){
        user_location = new google.maps.LatLng(user_lat,user_lng);
        user_pos_marker = new google.maps.Marker({position:user_location});
        old_lat = user_lat;
        old_lng = user_lng;
        drowCircleOnMap("./assets/Button-Blank-Red-icon (1).png");
        geocoder.geocode({ 'latLng': user_location }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    for (var i = 0; i < results[0].address_components.length; i++) {
                        var addr = results[0].address_components[i];
                        if (addr.types[0] == 'country')
                            country = addr.long_name;
                        else if (addr.types[0] == ['administrative_area_level_1'])
                            state = addr.long_name;
                        else if (addr.types[0] == ['locality'])
                            city = addr.long_name;
                    }
                    var box_add = results[0].formatted_address;
                    $('#pac-input').val(box_add);
                    search_accident_places(state,"state",false);
                }else{
                    $('#pac-input').val("cannot find address.");
                    console.log("No reverse geocode results.")
                }
            }else{
                $('#pac-input').val("cannot find address.");
                console.log("Geocoder failed: " + status)
            }
        });
    }else{
        var d = finddistance(old_lat , old_lng , user_lat , user_lng);
        if(d>=1){
            removeclust();
            user_location = new google.maps.LatLng(user_lat,user_lng);
            user_pos_marker = new google.maps.Marker({position:user_location});
            old_lat = user_lat;
            old_lng = user_lng;
            drowCircleOnMap("./assets/Button-Blank-Red-icon (1).png");
            geocoder.geocode({ 'latLng': user_location }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        var city = "",state = "",country = "";
                        for (var i = 0; i < results[0].address_components.length; i++) {
                            var addr = results[0].address_components[i];
                            if (addr.types[0] == 'country')
                                country = addr.long_name;
                            else if (addr.types[0] == ['administrative_area_level_1'])
                                state = addr.long_name;
                            else if (addr.types[0] == ['locality'])
                                city = addr.long_name;
                        }
                        var box_add = results[0].formatted_address;
                        $('#pac-input').val(box_add);
                        search_accident_places(state,"state",false);
                    }else{
                        $('#pac-input').val("cannot find address.");
                        console.log("No reverse geocode results.")
                    }
                }else{
                    $('#pac-input').val("cannot find address.");
                    console.log("Geocoder failed: " + status)
                }
            });
        }
    }
}

function fail(error){
  $('#pac-input').val("");
  var errorType={
    0:"Unknown Error",
    1:"Permission denied by the user",
    2:"Position of the user not available",
    3:"Request timed out"
  };
  var errMsg = errorType[error.code];
	if(error.code == 0 || error.code == 2){
	   errMsg = errMsg+" - "+error.message;
	}
  if(user_pos_marker != null)
    user_pos_marker.setMap(null);
  // console.log("fail");
	swal(errMsg);
  map.setZoom(2);
  map.setCenter(earth_center);
  if(watchID)
    navigator.geolocation.clearWatch(watchID);
  watchID = null;
  if(current_loc_interval != null)
    clearInterval(current_loc_interval);
  removeclust();
  if(user_pos_marker != null)
    user_pos_marker.setMap(null);
  current_loc_interval = Infinity;
}

//  tracking user end

function showSnackBar(){
    var x = document.getElementById("snackbar")
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function loading(unload){

    $('.loader').show("slow");
    // console.log('loading start');

    $('.door1').animate({
        top: '0',
        left: '0'
    },"slow");
    $('.door2').animate({
        top: '0',
        left: '50%'
    },"slow");
    $('.door3').animate({
        top: '50%',
        left: '0'
    },"slow");
    $('.door4').animate({
        top: '50%',
        left: '50%'
    },"slow");

    $('.sk-cube-grid').show("slow");

    setTimeout(function(){
        unload();
    },2000);

}

var unloading = function(){

    document.getElementById('cartain').style.display="none";
    $('.sk-cube-grid').hide("fast");

    $('.door1').animate({
        top: '-50%',
        left: '-50%'
    },"slow");
    $('.door2').animate({
        top: '-50%',
        left: '100%'
    },"slow");
    $('.door3').animate({
        top: '100%',
        left: '-50%'
    },"slow");
    $('.door4').animate({
        top: '100%',
        left: '100%'
    },"slow");

    $('.loader').hide("slow");
    // console.log('loading over');
    showSnackBar();

}

function onloading(){
    $('#dateshower').val(userselecteddate);
    document.getElementById('pac-input').focus();
}

function currentlocation(){
    lastfunction = currentlocation;
    map.setZoom(2);
    map.setCenter(earth_center);
    if(watchID)
        navigator.geolocation.clearWatch(watchID);
    watchID = null;
    if(current_loc_interval != null)
        clearInterval(current_loc_interval);
    current_loc_interval = null;
    removeclust();
    if( navigator.geolocation ){
        var optn = {
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0
        };
        watchID = navigator.geolocation.watchPosition(success, fail, optn);
        if(current_loc_interval != Infinity){
            current_loc_interval = setInterval(function(){
                if(watchID)
                    navigator.geolocation.clearWatch(watchID);
                watchID = navigator.geolocation.watchPosition(success, fail, optn);
            }, 5000);
        }
    }else{
        swal("HTML5 Not Supported Geolocation");
    }
}

function changemapstyle(){
    if(mapstyle === firsttheam){
        mapstyle = secondtheam;
        $('#allimg').css('border-color' , '#fff');
        $('.app-container').css('background-color' , '#fff');
        $('#screen').css('border-color' , '#fff');
        $('#notification').css('border-color' , '#fff');
        $('#locationimg').css('border-color' , '#fff');
    }else{
        mapstyle = firsttheam;
        $('.app-container').css('background-color' , '#424F6E');
        $('#allimg').css('border-color' , '#424F6E');
        $('#screen').css('border-color' , '#424F6E');
        $('#notification').css('border-color' , '#424F6E');
        $('#locationimg').css('border-color' , '#424F6E');
    }

    var temp_markers = markerCluster.getMarkers();
    var lastzoom = map.getZoom();
    var lastcenter = map.getCenter();

    initMap();
    labelcounter=0;
    infowindow =[];

    for(var i=0;i<temp_markers.length;i++){
        addLocation(temp_markers[i].lat,temp_markers[i].lng,temp_markers[i].imgURL,temp_markers[i].key,temp_markers[i].time);
    }

    map.setCenter(lastcenter);
    map.setZoom(lastzoom);

    if(typeof lastfunction === 'function'){
        if(lastfunction === currentlocation){
            drowCircleOnMap("./assets/Button-Blank-Red-icon (1).png");
        }else{
            setuserpos(only_user,"./assets/Button-Blank-Red-icon (1).png");
        }
    }
}

var socket=null;

$(document).ready(function(){

    Offline.checkConnection(1000);
    loading(unloading);
    socket = io();

    notificationnumber=0;
    document.getElementById("number").innerText = notificationnumber;
    var elem = document.getElementById('fullscreen');
    geocoder = new google.maps.Geocoder();

    //angular clock part start
    var app = angular.module('MyApp', []);
    app.controller('MyCtrl', function ($scope) {
        var lastdate;
        $scope.setdatevalue = function(){
            var temp_date=$('#dateshower').val();
            if(lastdate != temp_date){
                var pattern =/^([0-9]{2})\-([0-9]{2})\-([0-9]{4})$/;
                if(pattern.test(temp_date)){
                    userselecteddate=temp_date;

                    // date_ref = firebase.database().ref().child("accident_loc").child(userselecteddate);
                    marker_date = userselecteddate;
                    socket.emit('setDate',userselecteddate);
                    temp_date=temp_date.split("-");
                    if((new Date()).getFullYear() == parseInt(temp_date[2]) && ((new Date()).getMonth()+1)  == parseInt(temp_date[1]) && (new Date()).getDate() == parseInt(temp_date[0]) ){
                        istoday = true;
                        // console.log("today date set");
                    }else{
                        istoday=false;
                        // console.log("not today date");
                    }
                    if(typeof lastfunction === 'function'){
                        if(window.confirm("Do you want to refresh last event?")){
                            if(current_loc_interval != null)
                                clearInterval(current_loc_interval);
                            if(watchID)
                                navigator.geolocation.clearWatch(watchID);
                            watchID = null;
                            removeclust();
                            if(user_pos_marker != null)
                                user_pos_marker.setMap(null);
                            map.setZoom(2);
                            map.setCenter(earth_center);
                            lastfunction();
                        }else{
                            swal("Last event have been stopped.");
                        }
                    }
                    $scope.$broadcast('setdateandtime', {});
                }
            }
        };
        $scope.copylast = function(){
            lastdate = $('#dateshower').val();
        }
        $scope.initdate = function(){
            $scope.setcurrenttime();
            var day = (new Date().getDate()).toString();
            var month = (new Date().getMonth()+1).toString();
            var year = (new Date().getFullYear()).toString();
            if(day.length==1)
                day = "0"+day;
            if(month.length==1)
                month = "0"+month;
            userselecteddate = day+'-'+month+"-"+year;
            $('#dateshower').val(userselecteddate);
            $scope.setdatevalue();
            istoday = true;
        }
        $scope.setcurrenttime = function(){
            setInterval(function(){
                var ctime = (new Date()).toTimeString().split(" ")[0].trim();
                var splitval = (new Date()).toTimeString().split(" ")[0].trim();
                splitval = splitval.split(":");
                var hrs = parseInt(splitval[0]);
                var mins = parseInt(splitval[1]);
                var secs = parseInt(splitval[2]);
                var finaltimetext = "AM";
                if(hrs >= 12){
                    finaltimetext = "PM";
                }
                if(hrs >= 5 && hrs <= 18){
                    timeframe = "DAY";
                }else{
                    timeframe = "NIGHT";
                }
                if(timeframe !== lasttimeframe){
                    // console.log("time frame have been changed.")
                    lasttimeframe = timeframe;
                    changemapstyle();
                }
                hrs = hrs%12;
                if(hrs == 0){
                    hrs = 12;
                }
                hrs = hrs.toString();
                mins = mins.toString();
                secs = secs.toString();
                if(hrs.length==1){
                    hrs = "0"+hrs;
                }
                if(mins.length==1){
                    mins = "0"+mins;
                }if(secs.length==1){
                    secs = "0"+secs;
                }
                finaltimetext = hrs + ":" + mins + ":" + secs + " " + finaltimetext;
                $scope.$broadcast('settime', {time : finaltimetext});
                if(ctime === "00:00:00"){
                    if(window.confirm("Day changes." + "\n" + "Do you want to Set today's date?")){
                        lastdate = $('#dateshower').val();
                        var day = (new Date().getDate()).toString();
                        var month = (new Date().getMonth()+1).toString();
                        var year = (new Date().getFullYear()).toString();
                        if(day.length==1)
                            day = "0"+day;
                        if(month.length==1)
                            month = "0"+month;
                        userselecteddate = day+'-'+month+"-"+year;
                        $('#dateshower').val(userselecteddate);
                        $scope.setdatevalue();
                    }else{
                        istoday=false;
                        // console.log("not today date");
                    }
                }
            },1000);
        }
        $scope.setcurrentdate = function(){
            if($('.dateandtimepicker').css("display") === 'block'){
                $('.dateandtimepicker').animate({
                    height:'0',
                    width:'0'
                },"fast",function(){
                    $('.dateandtimepicker').css("display","none");
                    $('.dateandtimepicker').hide();
                });
            }else{
                if($('.datashowing').css("display") === 'block'){
                    $('.datashowing').animate({
                        height:"0",
                    },"fast",function(){
                        $('.datashowing').css("display" , "none");
                        $('.datashowing').hide();
                        tf.setcounter(tf.getcounter()+1);
                    });
                    $('#mapbuttons').animate({
                        marginBottom:"30px"
                    },"fast");
                }
                if(inoutdisplay){
                    inoutwindow();
                }
                $('.dateandtimepicker').css("display","block");
                $('.dateandtimepicker').show();
                $('.dateandtimepicker').animate({
                    height:'450px',
                    width:'400px'
                },"fast",function(){
                    $('.app-container').css("display","block");
                });
            }
            $scope.$broadcast('setdateandtime', {});
        }
        var ctrl = this;
        ctrl.updateDate = function (newdate) {
            console.log(newdate);
        };
    });
    // Date Picker
    app.directive('datePicker', function ($timeout, $window) {
        return {
            restrict: 'AE',
            scope: {
                selecteddate: "=",
                updatefn: "&",
                open: "=",
                datepickerTitle: "@",
                customMessage: "@",
                picktime: "@",
                pickdate: "@",
                pickpast: '=',
                pickfuture: '=',
                mondayfirst: '@'
            },
            transclude: true,
            link: function (scope, element, attrs, ctrl, transclude) {
                transclude(scope, function(clone, scope) {
                    element.append(clone);
                });
                if (!scope.selecteddate) {
                    scope.selecteddate = new Date();
                }
                if (attrs.datepickerTitle) {
                    scope.datepicker_title = attrs.datepickerTitle;
                }
                scope.days = [
                    { "long":"Sunday","short":"Sun" },
                    { "long":"Monday","short":"Mon" },
                    { "long":"Tuesday","short":"Tue" },
                    { "long":"Wednesday","short":"Wed" },
                    { "long":"Thursday","short":"Thu" },
                    { "long":"Friday","short":"Fri" },
                    { "long":"Saturday","short":"Sat" },
                ];
                if (scope.mondayfirst == 'true') {
                    var sunday = scope.days[0];
                    scope.days.shift();
                    scope.days.push(sunday);
                }
                scope.monthNames = [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ];
                function getSelected() {
                    if (scope.currentViewDate.getMonth() == scope.localdate.getMonth()) {
                        if (scope.currentViewDate.getFullYear() == scope.localdate.getFullYear()) {
                            for (var number in scope.month) {
                                if (scope.month[number].daydate == scope.localdate.getDate()) {
                                    scope.month[number].selected = true;
                                    if (scope.mondayfirst == 'true') {
                                        if (parseInt(number) === 0) {
                                            number = 6;
                                        } else {
                                            number = number - 1;
                                        }
                                    }
                                    scope.selectedDay = scope.days[scope.month[number].dayname].long;
                                }
                            }
                        }
                    }
                }
                function getDaysInMonth() {
                    var month = scope.currentViewDate.getMonth();
                    var date = new Date(scope.currentViewDate.getFullYear(), month, 1);
                    var days = [];
                    var today = new Date();
                    while (date.getMonth() === month) {
                        var showpastday = true;
                        var showfutureday = true;
                        if (!scope.pickpast && date < today) {
                            showpastday = false;
                        }else if(scope.pickpast && date < today){
                            showpastday = true;
                        }
                        if (!scope.pickfuture && date > today) {
                            showfutureday = false;
                        }else if(scope.pickfuture && date > today){
                            showfutureday = true;
                        }
                        if (today.getDate() == date.getDate() &&
                            today.getYear() == date.getYear() &&
                            today.getMonth() == date.getMonth()) {
                            showpastday = true;
                            showfutureday = true;
                        }
                        var day = new Date(date);
                        var dayname = day.getDay();
                        var daydate = day.getDate();
                        days.push({
                            'dayname': dayname,
                            'daydate': daydate,
                            'showpastday': showpastday ,
                            'showfutureday' : showfutureday
                        });
                        date.setDate(date.getDate() + 1);
                    }
                    scope.month = days;
                }
                function initializeDate() {
                    scope.currentViewDate = new Date(scope.localdate);
                    scope.currentMonthName = function () {
                        return scope.monthNames[scope.currentViewDate.getMonth()];
                    };
                    getDaysInMonth();
                    getSelected();
                }
                // Takes selected time and date and combines them into a date object
                function getDateAndTime(localdate) {
                    return new Date(localdate.getFullYear(), localdate.getMonth(), localdate.getDate());
                }
                // Convert to UTC to account for different time zones
                function convertToUTC(localdate) {
                    var date_obj = getDateAndTime(localdate);
                    var utcdate = new Date(date_obj.getUTCFullYear(), date_obj.getUTCMonth(), date_obj.getUTCDate(), date_obj.getUTCHours(), date_obj.getUTCMinutes());
                    return utcdate;
                }
                // Convert from UTC to account for different time zones
                function convertFromUTC(utcdate) {
                    localdate = new Date(utcdate);
                    return localdate;
                }
                scope.$watch('open', function() {
                    if (scope.selecteddate !== undefined && scope.selecteddate !== null) {
                        scope.localdate = convertFromUTC(scope.selecteddate);
                    } else {
                        scope.localdate = new Date();
                    }
                    initializeDate();
                });
                scope.selectDate = function (day) {
                    if (scope.pickdate == "true" && day.showpastday && day.showfutureday) {
                        for (var number in scope.month) {
                            var item = scope.month[number];
                            if (item.selected === true) {
                                item.selected = false;
                            }
                        }
                        day.selected = true;
                        scope.selectedDay = scope.days[day.dayname].long;
                        scope.localdate = new Date(scope.currentViewDate.getFullYear(), scope.currentViewDate.getMonth(), day.daydate);
                        initializeDate(scope.localdate);
                        scope.updateDate();
                    }
                };
                scope.updateDate = function () {
                    if (scope.localdate) {
                        var newdate = getDateAndTime(scope.localdate);
                    }
                };
                scope.moveForward = function () {
                    scope.currentViewDate.setMonth(scope.currentViewDate.getMonth() + 1);
                    if (scope.currentViewDate.getMonth() == 12) {
                        scope.currentViewDate.setDate(scope.currentViewDate.getFullYear() + 1, 0, 1);
                    }
                    getDaysInMonth();
                    getSelected();
                };
                scope.movedoubleForward = function () {
                    scope.currentViewDate.setFullYear(scope.currentViewDate.getFullYear() + 1);
                    getDaysInMonth();
                    getSelected();
                };
                scope.moveBack = function () {
                    scope.currentViewDate.setMonth(scope.currentViewDate.getMonth()-1);
                    if (scope.currentViewDate.getMonth() == -1) {
                        scope.currentViewDate.setDate(scope.currentViewDate.getFullYear() - 1, 0, 1);
                    }
                    getDaysInMonth();
                    getSelected();
                };
                scope.movedoubleBack = function () {
                    scope.currentViewDate.setFullYear(scope.currentViewDate.getFullYear()-1);
                    getDaysInMonth();
                    getSelected();
                };
                scope.calcOffset = function (day, index) {
                    if (index === 0) {
                        var offset = (day.dayname * 14.2857142) + '%';
                        if (scope.mondayfirst == 'true') {
                            offset = ((day.dayname - 1) * 14.2857142) + '%';
                        }
                        return offset;
                    }
                };
                scope.$on('settime', function(event , args){
                    scope.settime(args.time);
                });
                scope.settime = function(setval){
                    document.getElementById('timeshower').innerText = setval;
                }
                scope.savedate = function(){
                    var day = scope.localdate.getDate().toString();
                    var month = (scope.localdate.getMonth()+1).toString();
                    var year = scope.localdate.getFullYear().toString();
                    if(day.length==1){
                        day = "0" + day;
                    }
                    if(month.length==1){
                        month = "0" + month;
                    }
                    var setdate = day + "-" + month + "-" + year;
                    if($('.dateandtimepicker').css("display") === 'block'){
                        $('.dateandtimepicker').animate({
                            height:'0',
                            width:'0'
                        },"fast",function(){
                            $('.dateandtimepicker').css("display","none");
                            $('.dateandtimepicker').hide("fast",function(){
                                if(setdate !== scope.setlastdate){
                                    var pattern =/^([0-9]{2})\-([0-9]{2})\-([0-9]{4})$/;
                                    if(pattern.test(setdate)){
                                        $('#dateshower').val(setdate);
                                        userselecteddate=setdate;

                                        if((new Date()).getFullYear() == parseInt(year) && ((new Date()).getMonth()+1) == parseInt(month) && (new Date()).getDate() == parseInt(day) ){
                                            istoday = true;
                                            // console.log("set today date");
                                        }else{
                                            istoday=false;
                                            // console.log("not today date");
                                        }
                                        // date_ref = firebase.database().ref().child("accident_loc").child(userselecteddate);
                                        marker_date = userselecteddate;
                                        socket.emit('setDate',userselecteddate);
                                        if(typeof lastfunction === 'function'){
                                            if(window.confirm("Do you want to refresh last event?")){
                                                if(current_loc_interval != null)
                                                    clearInterval(current_loc_interval);
                                                if(watchID)
                                                    navigator.geolocation.clearWatch(watchID);
                                                watchID = null;
                                                removeclust();
                                                if(user_pos_marker != null)
                                                    user_pos_marker.setMap(null);
                                                map.setZoom(2);
                                                map.setCenter(earth_center);
                                                lastfunction();
                                            }else{
                                                swal("Last event have been stopped.");
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    }
                }
                scope.canceldate = function(){
                    if($('.dateandtimepicker').css("display") === 'block'){
                        $('.dateandtimepicker').animate({
                            height:'0',
                            width:'0'
                        },"fast",function(){
                            $('.dateandtimepicker').css("display","none");
                            $('.dateandtimepicker').hide();
                        });
                        scope.localdate=scope.lastdate;
                        initializeDate(scope.localdate);
                    }
                }
                scope.setTodayDate = function(){
                    scope.localdate = new Date();
                    scope.lastdate = scope.localdate;
                    initializeDate(scope.localdate);
                    scope.updateDate();
                    scope.savedate();
                    istoday = true;
                }
                scope.$on('setdateandtime', function(){
                    scope.setDateAndTime();
                });
                scope.setDateAndTime = function(){
                    //set current date
                    var tempdate = $('#dateshower').val();
                    tempdate = tempdate.split("-");
                    var takendate = tempdate[0];
                    var takenmonth = tempdate[1];
                    var takenyear = tempdate[2];
                    if(takendate.length==1){
                        takendate = "0" + takendate;
                    }
                    if(takenmonth.length==1){
                        takenmonth = "0" + takenmonth;
                    }
                    scope.setlastdate = takendate + "-" + takenmonth + "-" + takenyear;
                    scope.localdate=new Date(takenyear , takenmonth-1 , takendate);
                    scope.lastdate = scope.localdate;
                    initializeDate(scope.localdate);
                }
            }
        };
    });
    //angular clock part end

    initializeAutocomplete('pac-input');
    if (document.getElementById('mcs-horizontal-example').addEventListener) {
        document.getElementById('mcs-horizontal-example').addEventListener("mousewheel", scrollHorizontally, false);  // IE9, Chrome, Safari, Opera
        document.getElementById('mcs-horizontal-example').addEventListener("DOMMouseScroll", scrollHorizontally, false);  // Firefox
    } else {
        document.getElementById('mcs-horizontal-example').attachEvent("onmousewheel", scrollHorizontally);  // IE 6/7/8
    }

    $('.img1').on({
        click: function(){
            if($('.dateandtimepicker').css("display") === 'block'){
                $('.dateandtimepicker').animate({
                    height:'0',
                    width:'0'
                },"fast",function(){
                    $('.dateandtimepicker').css("display","none");
                    $('.dateandtimepicker').hide();
                    angular.element('#date_time').scope().$broadcast('setdateandtime', {});
                });
            }
            if(signin_status && !allowness){
                swal("Please verify the email address first and login again...\nUntil you verify email, you cannot use all features.");
                return;
            }
            if(!signin_status){
                swal("Please login first.");
                return;
            }
            currentlocation();
        }
    });

    $('.img2').on({
        click: function(){
            if($('.dateandtimepicker').css("display") === 'block'){
                $('.dateandtimepicker').animate({
                    height:'0',
                    width:'0'
                },"fast",function(){
                    $('.dateandtimepicker').css("display","none");
                    $('.dateandtimepicker').hide();
                    angular.element('#date_time').scope().$broadcast('setdateandtime', {});
                });
            }
            if(signin_status && !allowness){
                swal("Please verify the email address first and login again...\nUntil you verify email, you cannot use all features.");
                return;
            }
            if(!signin_status){
                swal("Please login first.");
                return;
            }
            $('#pac-input').val("All Places...");
            if(current_loc_interval != null)
                clearInterval(current_loc_interval);
            if(watchID)
                navigator.geolocation.clearWatch(watchID);
            watchID = null;
            removeclust();
            // console.log("img");
            if(user_pos_marker != null)
                user_pos_marker.setMap(null);
            map.setZoom(2);
            map.setCenter(earth_center);
            showallplaces();
        }
    });

    var firstfunction = function(){
        if(inoutdisplay){
            inoutwindow();
        }
        if($('.dateandtimepicker').css("display") === 'block'){
            $('.dateandtimepicker').animate({
                height:'0',
                width:'0'
            },"fast",function(){
                $('.dateandtimepicker').css("display","none");
                $('.dateandtimepicker').hide();
                angular.element('#date_time').scope().$broadcast('setdateandtime', {});
            });
        }
//        if(signin_status && !allowness){
//            swal("Please verify the email address first and login again...\nUntil you verify email, you cannot use all features.");
//            return;
//        }
        if(!signin_status){
            swal("Please login first.");
            return;
        }
        if($('.datashowing').css("display") === 'none'){
            $('.datashowing').css("display" , "block");
            $('.datashowing').show();
            $('.datashowing').animate({
                height:"290px",
            },"fast");
            $('#mapbuttons').animate({
                marginBottom:'300px'
            },"fast");
        }
    }

    var secondfunction = function(){
        if(inoutdisplay){
            inoutwindow();
        }
        if($('.datashowing').css("display") === 'block'){
            $('.datashowing').animate({
                height:"0",
            },"fast",function(){
                $('.datashowing').css("display" , "none");
                $('.datashowing').hide();
            });
            $('#mapbuttons').animate({
                marginBottom:'30px'
            },"fast");
            document.getElementById("number").innerText = 0;
            notificationnumber=0;
        }
    }

    var tf = new toggleSwitch(firstfunction,secondfunction);

    $('.img3').on({
        click: function(){
            tf.clickToggle();
        }
    });

    $('.img4').on({
        click: function(){
            if(document.webkitFullscreenElement) {
                document.webkitCancelFullScreen();
                $('#screen').attr('src','./assets/fullscreen.png');
            }
            else {
                elem.webkitRequestFullScreen();
                $('#screen').attr('src','./assets/exit.png');
            };
        }
    });

    $('.closepanel').on({
        click: function(){
            if($('.datashowing').css("display") === 'block'){
                $('.datashowing').animate({
                    height:"0",
                },"fast",function(){
                    $('.datashowing').css("display" , "none");
                    $('.datashowing').hide();
                    tf.setcounter(tf.getcounter()+1);
                });
                $('#mapbuttons').animate({
                    marginBottom:'30px'
                },"fast");
                document.getElementById("number").innerText = 0;
                notificationnumber=0;
            }
        }
    });

    function inoutwindow(){
        var random_num = Math.ceil(Math.random()*4);
        if(inoutdisplay){
            if(random_num==1){
                $('.userinfo').animate({
                    top : '-500px'
                });
            }else if(random_num==2){
                var width = window.innerWidth;
                width+=($('.userinfo').width()/2);
                $('.userinfo').animate({
                    left : width+'px'
                });
            }else if(random_num==3){
                var height = window.innerHeight;
                height+=($('.userinfo').height()/2);
                $('.userinfo').animate({
                    top : height+'px'
                });
            }else if(random_num==4){
                $('.userinfo').animate({
                    left : '-500px'
                });
            }
            $('.userinfo').hide("slow");
        }else{
          if(!signin_status){
            document.getElementById('emailid').focus();
          }
            //close calender
            if($('.dateandtimepicker').css("display") === 'block'){
                $('.dateandtimepicker').animate({
                    height:'0',
                    width:'0'
                },"fast",function(){
                    $('.dateandtimepicker').css("display","none");
                    $('.dateandtimepicker').hide();
                    angular.element('#date_time').scope().$broadcast('setdateandtime', {});
                });
            }
            //close notification window
            secondfunction();
            setuserprofile();
            $('.userinfo').show("fast");
            $('.userinfo').animate({
                left : '50%',
                top : '50%',
                transform: 'translate(-50%, -50%)'
            });
            $('.account').css({'height' : '700px'});

        }
        inoutdisplay = !inoutdisplay;
    }

    $('#in_out_btn').on({
        click: function(){
            accountbtnclick=true;
            inoutwindow();
        }
    });

    $('#signupBtn').on({
        click: function(){
            checkCodeAndSignIn(true);
        }
    });

    $('#loginBtn').on({
        click: function(){
            checkCodeAndSignIn(false);
        }
    });

    function checkEmailID(eid){
        var atpos = eid.indexOf("@");
        var dotpos = eid.lastIndexOf(".");
        if (atpos<1 || dotpos<atpos+2 || dotpos+2>=eid.length) {
            return false;
        }
        return true;
    }

    function checkmobilenumber(mno){
        var pattern = /^[\+]\d{2}[\-]\d{10}$/;
        return pattern.test(mno);
    }

    var checkCodeAndSignIn = function(flag){
        var temp_emailid = $('#emailid').val();
        var temp_passwd = $('#passwd').val();
        var error_flag = false;
        if(!signin_status && checkEmailID(temp_emailid) && (checkPassWd(temp_passwd) || !flag)){
            current_user = null;
            if(flag){
                swal({
                    icon: "warning",
                    title: "Confirmation!",
                    text: "Re-Enter your PassWord",
                    content: {
                        element: "input",
                        attributes: {
                            placeholder: "Type your password",
                            type: "password",
                        },
                    },
                    buttons: {
                        cancel: true,
                        confirm: true,
                    },
                }).then((value) => {
                    var ret_val=value;
                    if(ret_val === null){
                        return;
                    }else if(ret_val == ""){
                        swal("You need to write something!");
                        return;
                    }else if(ret_val !== temp_passwd){
                        swal("please enter valid password...");
                        return;
                    }
                    $.ajax({
                      type : 'POST',
                      url : '/signup',
                      data : {
                        emailID : temp_emailid,
                        pswd : temp_passwd
                      },
                      success : function(data){
                        if(data.code === 'error'){
                          swal(data.msg);
                        }else{
                          showuserprofile(data);
                        }
                      }
                    });
                });
            }else{
              $.ajax({
                type : 'POST',
                url : '/login',
                data : {
                  emailID : temp_emailid,
                  pswd : temp_passwd
                },
                success : function(data){
                  if(data.code === 'error'){
                    swal(data.msg);
                  }else{
                    showuserprofile(data);
                  }
                }
              });
            }
        }else{
            swal("Please try valide emailID or" + "\n" + "PassWord Strength must be atleast good...");
        }
    }

    function showuserprofile(user){
            current_user = user;
            if(current_user && !signin_status){
                signin_status=true;
                emailVerified = current_user.emailVerified;
                if(emailVerified){
                    allowness=true;
                }else{
                  swal("Verification Email Sended...\nUntil you verify email, you cannot use all features.\nverify email and login again.");
                }
                addnotificationlistener();
                setuserprofile();
            }else{
                //show login tab...
                signin_status=false;
                // console.log("User is currently SignOut.");
            }
      }

      function setuserprofile(){
          if(signin_status){
              // console.log('set user data');
              $.ajax({
                type : 'POST',
                url : '/userprofile',
                data : {
                  user : current_user
                },
                success : function(data){
                  displayName = data.dname;
                  email = data.email;
                  mobilenumber = data.mno;
                  latlong = data.latlong;
                  $('#user_name').val(data.dname);
                  $('#user_eid').val(data.email);
                  $('#user_tel').val(data.mno);
                  $('#user_latlong').val(data.latlong);
                  document.getElementById('account').style.display = "none";
                  document.getElementById('userprofile').style.display = "inline-block";
                }
              });
          }
      }

    $('#reset').on({
        click: function(){

            swal({
                icon: "warning",
                title: "ReSet PassWord!",
                text: "PassWord strength must be atleast good.",
                content: {
                    element: "input",
                    attributes: {
                        placeholder: "New PassWord...",
                        type: "password",
                    },
                },
                buttons: {
                    cancel: true,
                    confirm: true,
                },
            }).then((value) => {
                var new_pswd=value;
                if(new_pswd === null){
                    return;
                }else if(new_pswd == ""){
                    swal("You need to write something!");
                    return;
                }else{
                    var retval = checkPassWd(new_pswd);
                    if(retval){
                        swal({
                            icon: "warning",
                            title: "Confirm!",
                            text: "Are you sure with this PassWord?",
                            buttons: {
                                cancel: true,
                                confirm: true,
                            },
                        }).then((value)=>{
                            if(value){
                              $.ajax({
                                type : 'POST',
                                url : '/resetpswd',
                                data : {
                                  user : JSON.stringify(current_user),
                                  pswd : new_pswd,
                                },
                                success : function(data){
                                  if(data.code==='error'){
                                    swal(data.msg);
                                  }else if(data.code==='alert'){
                                    swal(data.msg);
                                  }
                                }
                              });
                            }
                        });
                    }else{
                        swal("PassWord strength should be atleast good!!!");
                    }
                }
            });
        }
    });

    $('#forgot').on({
        click: function(){
            if(checkEmailID($('#emailid').val())){
               if(window.confirm("are you sure you want to get password reset email?")){
                   var emailAddress = $('#emailid').val();

                   $.ajax({
                     type : 'POST',
                     url : '/forgotpswd',
                     data : {
                       email : emailAddress
                     },
                     success : function(data){
                       if(data.code === 'error'){
                         swal(data.msg);
                       }else if(data.code === 'alert'){
                         swal(data.msg);
                       }
                     }
                   });
               }
            }
        }
    });

    $('#user_save').on({
        click: function(){
            saveuserdata();
        }
    });

    function saveuserdata(){
        // console.log('saving user data...');
        var tmp_name = $('#user_name').val();
        var tmp_latlong = $('#user_latlong').val();
        var tmp_tel = $('#user_tel').val();
        $.ajax({
          type : 'POST',
          url : '/saveuserdata',
          data : {
            user : JSON.stringify(current_user),
            name : tmp_name,
            latlong : tmp_latlong,
            mno : tmp_tel
          },
          success : function(data){
            if(data.code === 'error'){
              swal(data.msg);
              setuserprofile();
            }
            // setuserprofile();
          }
        });
    }

    $('#signoutBtn').on({
        click: function(){
            signoutuser();
        }
    });

    function signoutuser(){
      signin_status=false;
      // console.log("SignOut Successful...");
      document.getElementById('account').style.display = "inline-block";
      document.getElementById('userprofile').style.display = "none";
      unsubscribe=null;
      current_user = null;
      allowness=false;
      mobilenumber="none",latlong="none,none",displayName="null",email="null",emailVerified=false,photoURL="null",isAnonymous=false,uid="null",providerData="null";
      // if(user_ref!=null)
      //   user_ref.off();
      user_ref=null,user_notifi_ref=null;
      // remove notifi listener
      clearnotifiwindow();
      // remove clusters
      if(current_loc_interval != null)
        clearInterval(current_loc_interval);
      if(watchID)
        navigator.geolocation.clearWatch(watchID);
      watchID = null;
      removeclust();
      if(user_pos_marker != null)
        user_pos_marker.setMap(null);
      map.setZoom(2);
      map.setCenter(earth_center);
    }
});

function setmaplisteners(){
    google.maps.event.addListener(map, 'dblclick', function(event){
        // console.log("map double click listener...")
        clickonmap(event.latLng);
    });

    google.maps.event.addListener(map, 'click', function(event){
        for(var i=0;i<infowindow.length;i++){
            infowindow[i].close();
        }
    });

    google.maps.event.addListener(map, 'zoom_changed', function(event){
        if(map.getZoom()==2){
            map.setCenter(earth_center);
        }
    });
}

function removemaplisteners(){
    google.maps.event.clearListeners(map, 'dblclick');
    google.maps.event.clearListeners(map, 'zoom_changed');
    google.maps.event.clearListeners(map, 'click');
}

function toggleSwitch(){

    this.functions = arguments;
    this.counter=0;

    this.clickToggle = function(){
        this.functions[(this.counter++)%this.functions.length]();
    };

    this.getcounter = function(){
        return this.counter;
    };

    this.setcounter = function(con){
        this.counter = con;
    };
}

function checkPassWd(pswd){
    var password_strength = document.getElementById("strength");

    if (pswd.length == 0) {
        password_strength.innerHTML = "";
        return;
    }

    //Regular Expressions.
    var regex = new Array();
    regex.push("[A-Z]"); //Uppercase Alphabet.
    regex.push("[a-z]"); //Lowercase Alphabet.
    regex.push("[0-9]"); //Digit.
    regex.push("[$@$!%*#?&]"); //Special Character.

    var passed = 0;

    //Validate for each Regular Expression.
    for (var i = 0; i < regex.length; i++) {
        if (new RegExp(regex[i]).test(pswd)) {
            passed++;
        }
    }

    //Validate for length of Password.
    if (passed > 2 && pswd.length > 8) {
        passed++;
    }

    //Display status.
    var color = "";
    var strength = "";
    switch (passed) {
        case 0:
        case 1:
            strength = "Weak";
            color = "red";
            break;
        case 2:
            strength = "Good";
            color = "darkorange";
            break;
        case 3:
        case 4:
            strength = "Strong";
            color = "green";
            break;
        case 5:
            strength = "Very Strong";
            color = "darkgreen";
            break;
                  }
    password_strength.innerHTML = strength;
    password_strength.style.color = color;

    if(passed<=1){
        return false;
    }else{
        return true;
    }
}
