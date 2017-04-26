
/*****************************************************************
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*****************************************************************/

/******************************************************************************************
*   App: Secret Messenger
*   Author: Jason Smyth
*   File: index.js
*   Version: 1.1
*   Date Modified: 20017-04-26
*   Description/App flow:
*       -Login/Register into account
*       -Populate list with messages in queue
*       -Tap on list item to open msg details modal
*       -App decripts image and sets the message to the message area
*       -Tap on delete button to delete message from server and list
*       -Tap send button, take picture, pick recepient, write message
*       -Tap Send to embed the message into the image's binary data and send to recepient
*******************************************************************************************/

var app = {
    currentId: null, //ID of logged in user
    currentGuid: null, //GUID of logged in user
    currentMsgId: null, //msg id of currently selected msg
    
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // initializes event listeners for buttons
    onDeviceReady: function () {
        document.getElementById("logBtn").addEventListener("touchstart", app.loginFunc);
        document.getElementById("regBtn").addEventListener("touchstart", app.registerFunc);
        document.getElementById("sendBtn").addEventListener("touchstart", app.toggleSendModal);
        document.getElementById("deleteBtn").addEventListener("touchstart", app.deleteMsg);
        
        document.getElementById("picBtn").addEventListener("touchstart", function () {
            let camOptions = {
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.PNG,
                mediaType: Camera.MediaType.PICTURE,
                pictureSourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                targetWidth: 300,
                targetHeight: 300
            };
            navigator.camera.getPicture(app.picSuccess, app.picFail, camOptions);
        });
        
        document.getElementById("refreshBtn").addEventListener("touchstart", function(){
            app.msgList();
        });
        document.getElementById("detBackBtn").addEventListener("touchstart", function(){
            app.toggleDetailsModal();
        });
        document.getElementById("sendBackBtn").addEventListener("touchstart", function(){
            app.toggleSendModal();
        })
    },

    // Called when tap Login btn
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
            if(data.code == 0){
                console.log(data);
                app.currentId = data.user_id;
                app.currentGuid = data.user_guid;
                console.log(app.currentId);
                console.log(app.currentGuid);
                app.toggleMsgModal();
            }else {
                console.log(data);
                let logRegForm = document.getElementById("logRegForm");
                let errorDiv = document.getElementById("errorDiv");
                errorDiv.innerHTML = "";
                let errorP = document.createElement("p");
                errorP.id = "errorP";
                errorP.innerHTML = data.message;
                errorDiv.appendChild(errorP);
             }
            
            })
            .catch(function (err) {
                alert(err.message);
        });
        document.activeElement.blur(); //closes keyboard
    },
    
    // Called when tap Register btn
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
                if(data.code == 0){
                console.log(data);
                app.currentId = data.user_id;
                app.currentGuid = data.user_guid;
                console.log(app.currentId);
                console.log(app.currentGuid);
                app.toggleMsgModal();
            }else {
                console.log(data);
                let logRegForm = document.getElementById("logRegForm");
                let errorDiv = document.getElementById("errorDiv");
                errorDiv.innerHTML = "";
                let errorP = document.createElement("p");
                errorP.id = "errorP";
                errorP.innerHTML = data.message;
                errorDiv.appendChild(errorP);
                
             }
            })
            .catch(function (err) {
                alert(err.message);
            });
        document.activeElement.blur();


    },
    
    // Builds message queue list from server data
    msgList: function () {
        console.log("building list");
        let formData = new FormData();
        formData.append("user_id", app.currentId);
        console.log(app.currentId);
        formData.append("user_guid", app.currentGuid);
        console.log(app.currentGuid);
        let options = {
            method: 'post',
            mode: 'cors',
            body: formData
        };
        let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-list.php");
        fetch(reg, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                let messages = data.messages;
                console.log(messages);
                let contentDiv = document.getElementById("msgList");
                contentDiv.innerHTML = "";
                let ul = document.createElement("ul");
                ul.className = "table-view";
                messages.forEach(function (element, index) {
                    let name = element.user_name;
                    let messageID = element.msg_id;
                    let senderID = element.sender_id;
                    let li = document.createElement("li");
                    li.className = "table-view-cell";
                    li.setAttribute("sender_id", senderID);
                    li.setAttribute("message_id", messageID);
                    li.addEventListener("touchstart", app.viewMsg);
                    let a = document.createElement("a");
                    a.className = "navigate-right";
                    a.textContent = "Message From: " + name;
                    li.appendChild(a);
                    ul.appendChild(li);
                    contentDiv.appendChild(ul);

                });

            })
            .catch(function (err) {
                alert(err.message);
            });

    },
    
    // Open/Close & sets up message modal
    toggleMsgModal: function () {
        app.msgList();
        let msgModal = document.getElementById("msgListModal");
        msgModal.classList.toggle("active");
    },

    // Called when tap on message list item
    viewMsg: function (ev) {
        let li = ev.currentTarget;
        console.log(li);
        app.currentMsgId = li.getAttribute("message_id");
//        app.currentMsgId = msgID;

        let formData = new FormData();
        formData.append("user_id", app.currentId);
        formData.append("user_guid", app.currentGuid);
        formData.append("message_id", app.currentMsgId);
        console.log(app.currentMsgId);
        console.log(formData);
        let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-get.php");
        let options = {
            method: 'post',
            mode: 'cors',
            body: formData
        };
        fetch(reg, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                document.getElementById("msgDetTitle").textContent = li.textContent;
                let contentDiv = document.getElementById("imageDetBox");
                let canvas = document.createElement("canvas");
                console.log(canvas);
                canvas.id = "receivedImg";
                contentDiv.innerHTML = "";
                let ctx = canvas.getContext('2d');
                let img = document.createElement("img");
                img.crossOrigin = 'anonymous';
                img.src = 'https://griffis.edumedia.ca/mad9022/steg/' + data.image;
                console.log(img);
                img.addEventListener('load', function (ev) {
                    //image has been loaded
                    var w = img.width;
                    var h = img.height;
                    canvas.width = 300;
                    canvas.height = 300;
                    ctx.drawImage(img, 0, 0);
                    imageDetBox.appendChild(canvas);
                    app.decodeMsg(canvas);
                    
                    
                });
                 app.toggleDetailsModal();
            })
            .catch(function (err) {
                alert(err.message);
            });

    },
    
    // Function to decode received message
    decodeMsg: function(canvas) {
        let msgArea = document.getElementById("msgArea");
        console.log(BITS.getUserId(canvas));
        console.log(BITS.getMessage(app.currentId, canvas));
        msgArea.value =  BITS.getMessage(app.currentId, canvas);
        
    },
    
    // Open/Close & sets up send modal
    toggleSendModal: function () {
        app.sendModal();
        let sendModal = document.getElementById("msgSend");
        sendModal.classList.toggle("active");
    },

    // Success callback function to handle image data
    picSuccess: function (imageURI) {
        console.log("success!");
//        app.imageSend = imageURI;
        let picBtn = document.getElementById("picBtn");
        let sendBtn = document.getElementById("sendPicBtn");
        let imageBox = document.getElementById("imageBox");
        imageBox.innerHTML = "";
        let canvas = document.createElement("canvas");
        canvas.id = "sendPicCanvas";
        let ctx = canvas.getContext('2d');
        let img = document.createElement("img");
        console.log(imageURI);
        img.src = imageURI;
        img.crossOrigin = 'anonymous';
        img.addEventListener('load', function (ev) {
            //image has been loaded
            var w = img.width;
            var h = img.height;
            console.log(w);
            console.log(h);
            canvas.width = 300;
            canvas.height = 300;
            ctx.drawImage(img, 0, 0);
        });
        picBtn.style.display = "none";
        sendPicBtn.style.display = "block";
        sendPicBtn.addEventListener("touchstart", app.sendMsg);

        imageBox.appendChild(canvas);
    },

    // Fail callback to handle picture failure
    picFail: function (err) {
        alert("Camera has failed" + err.message);
    },

    // Sets up send modal by populating user list
    sendModal: function () {
        //fetching user_list data
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

    // Called when tap on send btn
    sendMsg: function () {
//        app.msgEmbed();
        let canvas = document.getElementById("sendPicCanvas");
        let embededCanvas = app.msgEmbed(canvas);
        let recipientID = document.getElementById("userList").value;
        let dataURL = embededCanvas.toDataURL();
        console.log(BITS.getMessage(recipientID, embededCanvas));
        app.dataURLToBlob(dataURL)

            .then (function (blob) {
                console.log("this is a blob");
                console.log(blob);
                let formData = new FormData();
                formData.append("user_id", app.currentId);
                formData.append("user_guid", app.currentGuid);
                formData.append("recipient_id", recipientID);
                formData.append('image', blob);

                let options = {
                    method: 'post',
                    mode: 'cors',
                    body: formData
                };
                let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-send.php");

                fetch(reg, options)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        console.log(data);
                        app.msgList();
                    

                    })
                    .catch(function (err) {
                        alert(err.message);
                    });
            document.activeElement.blur();

            });
        document.getElementById("imageBox").innerHTML = "";
        document.getElementById("msgBox").value = "";
        let msgModal = document.getElementById("msgSend");
        msgModal.classList.remove("active");
        document.getElementById("picBtn").style.display = "block";
        
        
    },

    // Function to embed message data into image
    msgEmbed: function (canvas) {
        let userID = document.getElementById("userList").value;
        console.log(userID);
        
        let bitID = BITS.numberToBitArray(userID);
        console.log("bitID:");
        console.log(bitID);
        console.log(BITS.bitArrayToNumber(bitID));
        
        let message = document.getElementById("msgBox").value.trim();
        
        let bitMsg = BITS.stringToBitArray(message);
        console.log("bitMsg:");
        console.log(bitMsg);
        
        let msgLength = message.length;
        
        let bitLength = BITS.numberToBitArray(msgLength * 16);
        console.log("bitLength:");
        console.log(bitLength);
//        let canvas = document.getElementById("sendPicCanvas");

        //setting binary data into image
        canvas = BITS.setUserId(bitID, canvas);
        
        console.log("userId taken from the canvas");
        console.log(BITS.getUserId(canvas));
        
        canvas = BITS.setMsgLength(bitLength, canvas);
        
        console.log("message length taken from the canvas");
        console.log(BITS.getMsgLength(canvas));
        
        canvas = BITS.setMessage(bitMsg, canvas);
        
        console.log("message taken from the canvas");
        console.log(BITS.getMessage(userID, canvas));
        
        return canvas;

    },
    
    // Called when tap on delete btn
    deleteMsg: function () {
        let formData = new FormData();
        formData.append("user_id", app.currentId);
        formData.append("user_guid", app.currentGuid);
        formData.append("message_id", app.currentMsgId);
        let options = {
            method: 'post',
            mode: 'cors',
            body: formData
        };
        let reg = new Request("https://griffis.edumedia.ca/mad9022/steg/msg-delete.php");
        console.log(formData);
        console.log(options);

        fetch(reg, options)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
            })
            .catch(function (err) {
                alert(err.message);
            });
        app.msgList();
        app.toggleDetailsModal();
    },

    // Actually builds user list html
    buildUserList: function (data) {
        let userList = document.getElementById("userList");
        userList.innerHTML = "";
        data.users.forEach(function (element, index) {
            let id = element.user_id;
            let name = element.user_name;
            console.log(id);
            console.log(name);
            let option = document.createElement("option");
            option.value = id;
            option.text = name;
            userList.add(option);
        });

    },

    // Open/Close & sets up details modal
    toggleDetailsModal: function () {
        let detailsModal = document.getElementById("msgDetails");
        let imageDetBox = document.getElementById("imageDetBox");
        imageDetBox.innerHTML = "";
//        let blah = detailsModal.getElementsByTagName('textarea') [0];
//        console.log (blah);
//        blah.value = "";
        let msgArea = document.getElementById("msgArea");
        msgArea.value = "";
        detailsModal.classList.toggle("active");
    },

    // Converts dataURL to Blob
    dataURLToBlob: function (dataURL) {
        return Promise.resolve().then(function () {
            var type = dataURL.match(/data:([^;]+)/)[1];
            var base64 = dataURL.replace(/^[^,]+,/, '');
            var buff = app.binaryStringToArrayBuffer(atob(base64));
            return new Blob([buff], {
                type: type
            });
        });
    },
    
    // Buffer
    binaryStringToArrayBuffer: function (binary) {
        var length = binary.length;
        var buf = new ArrayBuffer(length);
        var arr = new Uint8Array(buf);
        var i = -1;
        while (++i < length) {
            arr[i] = binary.charCodeAt(i);
        }
        return buf;
    }
};

app.initialize();
