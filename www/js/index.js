/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    currentId: null,
    currentGuid: null,
    imageSend: null,
    imageReceive: null,
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        document.getElementById("logBtn").addEventListener("touchstart", app.loginFunc);
        document.getElementById("regBtn").addEventListener("touchstart", app.registerFunc);
        document.getElementById("sendBtn").addEventListener("touchstart", app.toggleSendModal)
        document.getElementById("picBtn").addEventListener("touchstart", function () {
            let camOptions = {
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.PNG,
                mediaType: Camera.MediaType.PICTURE,
                pictureSourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                targetWidth: 400,
                targetHeight: 400
            };
            navigator.camera.getPicture(app.picSuccess, app.picFail, app.camOptions);
        })
    },

    loginFunc: function () {
        let usernameVal = document.getElementById("username").value;
        let emailVal = document.getElementById("email").value;
        let formData = new FormData();
        formData.append("user_name", usernameVal);
        formData.append("email", emailVal);
        let options = {
            method: 'post',
            mode: 'cors',
            body: formData
        };
        let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/login.php");
        console.log(formData);
        console.log(options);

        fetch(reg, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                if (data.code != 0) {
                    alert("Login/Registration failed:\n" + data.message);
                } else {
                    app.currentId = data.user_id;
                    app.currentGuid = data.user_guid;
                    console.log(app.currentId);
                    console.log(app.currentGuid);
                }
            })
            .catch(function (err) {
                alert(err.message);
            });

        app.toggleMsgModal();


    },

    registerFunc: function () {
        let usernameVal = document.getElementById("username").value;
        let emailVal = document.getElementById("email").value;
        let formData = new FormData();
        formData.append("user_name", usernameVal);
        formData.append("email", emailVal);
        let options = {
            method: 'post',
            mode: 'cors',
            body: formData
        };
        let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/register.php");
        console.log(formData);
        console.log(options);

        fetch(reg, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                if (data.code != 0) {
                    alert("Login/Registration failed:\n" + data.message);
                } else {
                    app.currentId = data.user_id;
                    app.currentGuid = data.user_guid;
                    console.log(app.currentId);
                    console.log(app.currentGuid);
                }
            })
            .catch(function (err) {
                alert(err.message);
            });

        app.toggleMsgModal();
    },

    msgList: function () {

    },

    toggleMsgModal: function () {
        //app.msgList();
        let msgModal = document.getElementById("msgList");
        msgModal.classList.toggle("active");
    },

    toggleSendModal: function () {
        app.sendModal();
        let sendModal = document.getElementById("msgSend");
        sendModal.classList.toggle("active");
    },

    picSuccess: function (imageURI) {
        console.log("success!");
        app.imageSend = imageURI;
        let picBtn = document.getElementById("picBtn");
        let sendBtn = document.getElementById("sendPicBtn");
        let imageBox = document.getElementById("imageBox");
        imageBox.innerHTML = "";
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext('2d');
        let img = document.createElement("img");
        img.src = "data:image/jpeg;base64," + imageURI;
        img.addEventListener('load', function (ev) {
            //image has been loaded
            var w = img.width;
            var h = img.height;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
        });
        picBtn.style.display = "none";
        sendPicBtn.style.display = "block";
        
        imageBox.appendChild(canvas);
    },
    
    picFail: function(err) {
      alert("Camera has failed" + err.message);  
    },

    sendModal: function () {
        
        let formData = new FormData();
        formData.append("user_id", app.currentId);
        formData.append("user_guid", app.currentGuid);
        let options = {
            method: 'post',
            mode: 'cors',
            body: formData
        };
        let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/user-list.php");
        fetch(reg, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                app.buildUserList(data);
                
            })
            .catch(function (err) {
                alert(err.message);
            });
    },
    
    buildUserList: function(data) {
        let userList = document.getElementById("userList");
        userList.innerHTML = "";
        data.users.forEach(function (element, index){
            let id = element.user_id;
            let name = element.user_name;
            console.log(id);
            console.log(name);
            let option = document.createElement("option");
            option.value = id;
            option.text = name;
            userList.add(option);
            
        })
        
    },

    toggleDetailsModal: function () {
        let detailsModal = document.getElementById("msgDetails");
        detailsModal.classList.toggle("active");
    },
};

app.initialize();
