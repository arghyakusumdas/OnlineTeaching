global.Buffer = global.Buffer || require("buffer").Buffer;
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
/////////////////////////////////////////////////////////
//Template.hello.onCreated(function helloOnCreated() {
//  // counter starts at 0
//  this.counter = new ReactiveVar(0);
//});
//
//Template.hello.helpers({
//  counter() {
//    return Template.instance().counter.get();
//  },
//});
//
//Template.hello.events({
//  'click button'(event, instance) {
//    // increment the counter when button is clicked
//    instance.counter.set(instance.counter.get() + 1);
//  },
//});
//////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////
//Start: Define required modules
//////////////////////////////////////////////////////////////////////
var getUserMedia = require('getusermedia')
var myWaveSurfer = require('wavesurfer')
var Buffer = require('buffer/').Buffer
//////////////////////////////////////////////////////////////////////
//End: Define required modules
//////////////////////////////////////////////////////////////////////


getUserMedia({ video: true, audio: true }, function (err, stream) { //Possibly don't need any more
  //**********************************************//
  //Start: Connection setup
  //**********************************************//
  var connection = new RTCMultiConnection();
  // this line is VERY_important.... need to replace with own server implementation
  connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
  // all below lines are optional; however recommended.
  connection.session = {
      audio: true,
      video: true,
      data: true
  };
  connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
  };
  //**********************************************//
  //End: Connection setup
  //**********************************************//

  //**********************************************//
  //Start: Video chat
  //**********************************************//
  connection.onstream = function(event) {
      if (event.type === 'local') {
          document.getElementById('visVideo').appendChild( event.mediaElement );
      }
      if (event.type === 'remote') {
          document.getElementById('visVideo').appendChild( event.mediaElement );
      }
  };
  connection.onmessage = appendDIV;
  document.getElementById('butOpenRoom').onclick = function() {
      var predefinedRoomId = document.getElementById('textRoomPwd').value;
      console.log(predefinedRoomId)
      this.disabled = true;
      connection.open( predefinedRoomId );
  };
  document.getElementById('butJoinRoom').onclick = function() {
      var predefinedRoomId = document.getElementById('textRoomPwd').value;
      console.log(predefinedRoomId)
      this.disabled = true;
      connection.join( predefinedRoomId );
  };
  //**********************************************//
  //End: Video chat
  //**********************************************//

  //**********************************************//
  //Start: File sharing (ToDo)
  //**********************************************//
  //document.getElementById('share-file').onclick = function() {
  //    var fileSelector = new FileSelector();
  //    fileSelector.selectSingleFile(function(file) {
  //        connection.send(file);
  //    });
  //};
  //**********************************************//
  //End: File sharing (ToDo)
  //**********************************************//

  //**********************************************//
  //Start: text chat
  //**********************************************//
  document.getElementById('input-text-chat').onkeyup = function(e) {
      if (e.keyCode != 13) { return;}
      var yourName = document.getElementById('input-text-name').value
      // removing trailing/leading whitespace
      this.value = this.value.replace(/^\s+|\s+$/g, '');
      if (!yourName.length || !this.value.length) return;
      connection.send(yourName + ':' + this.value);
      appendDIV(yourName+ ':' + this.value);
      this.value = '';
  };
  var chatContainer = document.querySelector('.chat-output');
  function appendDIV(event) {
      var div = document.createElement('div');
      idPlaceHolder = '::::SentByVirtualClinic'
      chatData = event.data || event + idPlaceHolder;
      if (chatData.includes("junkMedicinePrescription")) {//It's a prescription
          document.getElementById('textAreaPrescription').value = chatData.replace('junkMedicinePrescription', '').replace(idPlaceHolder, '');
      }
      else if (chatData.includes(idPlaceHolder)){
          div.innerHTML = "<span style='color: grey;'>" + chatData.replace(idPlaceHolder, '') + "</span>";
      }
      else {
          div.innerHTML = "<span style='color: blue;'>" + chatData + "</span>";
      }
      chatContainer.insertBefore(div, chatContainer.firstChild);
      div.tabIndex = 0;
      div.focus();
      document.getElementById('input-text-chat').focus();
  }
  //**********************************************//
  //End: text chat
  //**********************************************//

    //**********************************************//
    //Start: Screen share in github (sharing)
    //**********************************************//
    document.getElementById('butShareScreen').addEventListener('click', function() { //patient side share screen in a new window
        console.log("inside butScreenShare");
        var win = window.open('https://arghyakusumdas.github.io/myShare/#'+document.getElementById('textRoomPwd').value, '_blank', 'width=500,height=400');
        win.focus();
    })
    //**********************************************//
    //End: Screen share in github (sharing)
    //**********************************************//

    //**********************************************//
    //Start: Shared screen preview in github (Viewing)
    //**********************************************//
    document.getElementById('butViewScreen').addEventListener('click', function() { //doc side preview scren in the same window
        console.log("inside butEnlargedLiveScreen. value = " + document.getElementById("textRoomPwd").value);

        var htmlScreenShare = '<p align="left"><a href="https://arghyakusumdas.github.io/myShare/#'+document.getElementById("textRoomPwd").value + '" target="_blank">Click for full window</a> <br> <object type="text/html" data="https://arghyakusumdas.github.io/myShare/#'+document.getElementById("textRoomPwd").value + '" width="930" height="400"></object></p>';
        console.log(htmlScreenShare);
        document.getElementById("evtLiveReport").innerHTML=htmlScreenShare;
    })
    //**********************************************//
    //End: Shared screen preview in github (Viewing)
    //**********************************************//
})//End getUserMedia
