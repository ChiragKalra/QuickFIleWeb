//initialise Firebase

const firebaseConfig = {
  apiKey: "AIzaSyCqxCU7sGps89AA_-yNwijjT2yeblG3qEo",
  authDomain: "quick-2b172.firebaseapp.com",
  databaseURL: "https://quick-2b172.firebaseio.com",
  projectId: "quick-2b172",
  storageBucket: "quick-2b172.appspot.com",
  messagingSenderId: "21587111177",
  appId: "1:21587111177:web:1b36f04791073462"
};

firebase.initializeApp(firebaseConfig);

//get elements
const txtElementToken = document.getElementById("token");
const fileUpload = document.getElementById("upload");

$("#upload").toggle();
$(".no").toggle();

fileUpload.addEventListener('change', function(e) {
  firebase.database().ref('curr').once('value').then(function(snapshot) {
    firebase.database().ref('curr').set(snapshot.val()+1);
    let file = e.target.files[0];
    let ext = file.name.split('.').pop();
    let strgref = firebase.storage().ref(snapshot.val() + '.' + ext);
    let filedat = {
      time: (new Date()).getTime(),
      ext: ext,
      name: file.name.split('.')[0],
      link: "gs://quick-2b172.appspot.com/" + snapshot.val() + '.' + ext,
    };

    let loader = $("<div id=\"pro"+snapshot.val()+"\" class=\"progress progress-bar-vertical\">\n" +
      "    <div id=\"prog"+snapshot.val()+ "\"class=\"progress-bar progress-bar-success progress-bar-striped active\" role=\"progressbar\" " +
      "aria-valuenow=\"100\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"height: 0;\">\n" +
      "    </div></div>");
    let id = snapshot.val();
    $('.content').append(loader);
    $("#prog"+id).text(file.name);

    firebase.database().ref('files/'+snapshot.val()).set(filedat);
    strgref.put(file).on('state_changed',
      function progress(snapshot) {
        let perc = snapshot.bytesTransferred/snapshot.totalBytes;
        $("#prog"+id).attr("style", "height: " + perc * 100+'%;');
      },
      function error(e) {},
      function complete() {
        let newItem = document.createElement("a");
        newItem.id = id;
        $('.content').prepend(newItem);
        $('#'+id).addClass('itemee').text(file.name).attr("target", "_blank");
        $('#pro'+id).toggle();
      }
    );
  });
});

txtElementToken.onkeypress = keypress;
function keypress(e) {
  if (e.code === "Enter") {
    $(".login").toggle();
    $(".loading").toggle();
    firebase.database().ref('key').once('value').then(function(snapshot) {
      if (txtElementToken.value == snapshot.val()) {
        firebase.database().ref('upload').once('value').then(function (snapshot) {
          if (!snapshot.val()) {
            $(".upload").hide();
            $(".no").show();
          }
        });
        firebase.database().ref('public').once('value').then(function(snapshot) {
          const list = snapshot.val();
          if (list!=null && list.length!==0) {
            //download data
            for(let i = 0; i < list.length; i++) {
              firebase.database().ref('files/'+list[i]).once('value').then(function (snapshot) {
                firebase.storage().refFromURL(snapshot.val().link).getDownloadURL().then(function(url) {
                  let newItem = document.createElement("a");
                  newItem.href = url;
                  let id = snapshot.val().link.split('/').pop().split('.')[0];
                  newItem.id = id;
                  $('.content').append(newItem);
                  $('#'+id).addClass('itemee').text(snapshot.val().name+'.'+snapshot.val().ext)
                    .attr("target", "_blank");
                  if (i === list.length-1) {
                    $(".no").hide();
                    $(".content").toggle();
                    $(".loading").toggle();
                  }
                });
              });
            }
          } else {
            $(".content").toggle();
            $(".loading").toggle();
          }
        });
      } else {
        txtElementToken.value = '';
        $(".login").toggle();
        $(".loading").toggle();
      }
    });
  }
}
