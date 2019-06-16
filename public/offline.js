var Offline = new offline();

function offline(){

    let div1,ref_int;

    this.checkConnection = function(int){

        if(div1){
            var temp = document.getElementById('alert_ele');
            delete temp;
            // console.log('not yet');
        }

        var temp = document.getElementById('text');
        if(temp)
            temp.parentNode.removeChild(temp);
        temp = document.getElementById('signal');
        if(temp)
            temp.parentNode.removeChild(temp);

        clearInterval(ref_int);

        ref_int = null;
        var connection = false;
        var flag = false;
        var class_name;
        var set_text;

        div1 = document.createElement("div");
        div1.setAttribute("id", "alert_ele");
        div1.setAttribute("class", "alert_ele");
        document.body.appendChild(div1);

        ref_int = setInterval(function(){
            if(navigator.onLine){
                connection = true;
                class_name = 'green';
                set_text = "Your device is connected to the internet.";

                if(flag){
                    setTimeout(function(){
                        if(connection){
                            flag = false;
                            $('.alert_ele').animate({
                                top : '-60px',
                                transform: 'translate(-50%, -50%)'
                            });
                        }
                    },3000);
                }
                // console.log('online');
            }else{
                connection = false;
                class_name = 'red';
                set_text = "Your device lost its internet connection.";

                if(!flag){
                    flag = true;
                    $('.alert_ele').animate({
                        top : '30px',
                        transform: 'translate(-50%, -50%)'
                    });
                }
                // console.log('offline');
            }

            var cir = document.getElementById('signal');
            if(cir)
                cir.parentNode.removeChild(cir);
            cir = document.createElement("div");
            cir.setAttribute('id','signal');
            cir.setAttribute('class',class_name);
            document.getElementById('alert_ele').appendChild(cir);

            var para = document.getElementById('text');
            if(para)
                para.parentNode.removeChild(para);
            para = document.createElement("P");
            var t = document.createTextNode(set_text);
            para.setAttribute('id','text');
            para.appendChild(t);
            document.getElementById("alert_ele").appendChild(para);

        },int);
    }
}
