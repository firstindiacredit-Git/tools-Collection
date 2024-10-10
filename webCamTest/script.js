 
   "use strict"
   var isfullscreen=false;
   var captureState=false;
   var videoTracks,audioTracks;
   const alertElem = document.getElementsByClassName("alert")[0];
   const fullElem = document.getElementById("full");
   const camsel = document.getElementById("camsel");
   const micsel = document.getElementById("micsel");
   const video = document.getElementById("vid");
   const canvas = document.createElement("canvas");
   const image = document.getElementById("imgid");
   const testbtn = document.getElementById("testbtn");
   const getimgbtn = document.getElementById("getimgbtn");
   const downimgbtn = document.getElementById("downimgbtn");
   const bar = document.getElementById("bar");
   const miccan = document.getElementById('miccan');
   const miccanCtx = miccan.getContext("2d");
   window.addEventListener("DOMContentLoaded",function() {
      alertElem.style.display = "none";
      videoTracks=audioTracks=null;
      testbtn.onclick=function() { initVideo(); };
      getimgbtn.onclick=function() { getImage(); };
      video.onclick=function() { getImage(); };
      image.onclick=function() { getImage(); };
      downimgbtn.onclick=function() { downloadImage(); };
      const supports = navigator.mediaDevices.getSupportedConstraints();
      if (!supports['facingMode']) {
         alert('Browser does not support webcam facingMode!');
      }
      initPoly();
      initCameraMicSelects();
   });
   function initPoly()
   {
      if (navigator.mediaDevices === undefined) {
         navigator.mediaDevices = {};
      }
      if (navigator.mediaDevices.getUserMedia === undefined) {
         navigator.mediaDevices.getUserMedia = function(constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {
               return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function(resolve, reject) {
               getUserMedia.call(navigator, constraints, resolve, reject);
            });
         }
      }
   }
   function initCameraMicSelects()
   {
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
         console.log("enumerateDevices() not supported.");
         camsel.style.display = "none";
         micsel.style.display = "none";
         return;
      }

      navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
         var icam=0,imic=0;
         devices.forEach(function(device) {
            console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
            var opt = document.createElement('option');
            if( device.kind=="videoinput" ) {
               //opt.value = i;
               opt.innerHTML = "Camera #"+(++icam);
               camsel.appendChild(opt);
            }
            else if( device.kind=="audioinput" ) {
               opt.innerHTML = "Microphone #"+(++imic);
               micsel.appendChild(opt);
            }
            else { 
            }
         });
      })
      .catch(function(err) {
         console.log(err.name + ": " + err.message);
      });
   }
   function setCameraInfo()
   {
      var i = camsel.selectedIndex;
      var track = videoTracks[i];
      var settings = videoTracks[0].getSettings();
      const tbl = document.getElementById("tbl");
      var res=((settings.width*settings.height)/1e6).toFixed(2);
      tbl.rows[0].cells[1].innerHTML = videoTracks[0].label;
      tbl.rows[1].cells[1].innerHTML = res+" megapixels";
      tbl.rows[2].cells[1].innerHTML = settings.width+" pixels";
      tbl.rows[3].cells[1].innerHTML = settings.height+" pixels";
      tbl.rows[4].cells[1].innerHTML = settings.aspectRatio;
      tbl.rows[5].cells[1].innerHTML = settings.brightness;
      tbl.rows[6].cells[1].innerHTML = settings.contrast;
      tbl.rows[7].cells[1].innerHTML = settings.facingMode;
      tbl.rows[8].cells[1].innerHTML = settings.frameRate+" frames/second";
      tbl.rows[9].cells[1].innerHTML = settings.saturation;
      tbl.rows[10].cells[1].innerHTML = settings.sharpness;
   }
   function setMicInfo()
   {
      var i = micsel.selectedIndex;
      var track = audioTracks[i];
      var settings = audioTracks[0].getSettings();
      const tbl = document.getElementById("tbl2");
      tbl.rows[0].cells[1].innerHTML = audioTracks[0].label;
      tbl.rows[1].cells[1].innerHTML = settings.autoGainControl;
      tbl.rows[2].cells[1].innerHTML = settings.channelCount;
      tbl.rows[3].cells[1].innerHTML = settings.echoCancellation;
      tbl.rows[4].cells[1].innerHTML = settings.latency+" second";
      tbl.rows[5].cells[1].innerHTML = settings.noiseSuppression;
      tbl.rows[6].cells[1].innerHTML = settings.sampleRate+" Hz";
      tbl.rows[7].cells[1].innerHTML = settings.sampleSize+" bits";
   }
   function initAudio()
   {
   }
   function initVideo(icam)
   {
      stopVideo();
      //const sleep = ms => new Promise(res => setTimeout(res, ms));
      var constraints = {
         //audio: false, 
         audio: true, 
         video: {
            width: { ideal: 4096 },
            height: { ideal: 2160 },
            //facingMode: { exact: "user" }
            facingMode: { ideal: "user" }
            //facingMode: { ideal: "environment" }
         } };
      var icam=camsel.selectedIndex;
      if( icam==1 ) { constraints.video.facingMode = { exact: "environment" }; }
      alertElem.style.display = "none";
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(mediaStream) {
      //.then(async mediaStream => {
      //.then(function success(mediaStream) {
         //var video = document.querySelector('video');
         visualize(mediaStream);
         video.srcObject = mediaStream;
         video.onloadedmetadata = function(e) {
            video.play();
            //initSize();
         };

         //await sleep(1000);

         videoTracks = mediaStream.getVideoTracks();
         audioTracks = mediaStream.getAudioTracks();
         //initCameraMicSelects();
         setCameraInfo();
         setMicInfo();
         console.log(videoTracks[0]);
         console.log(videoTracks[0].getSettings());
         var i=micsel.selectedIndex;
         console.log(audioTracks[i]);
         console.log(audioTracks[i].getSettings());
      })
      .catch(function(err) {
         console.log(err.name + ": " + err.message);
         if( get_browser()=="Chrome" ) {
            alertElem.style.display = "block";
         }
      });
   }
   function stopAudio()
   {
      audioTracks.forEach(track => track.stop());
   }
   function stopVideo()
   {
      if( videoTracks==null ) return;
      videoTracks.forEach(track => track.stop());
   }
   function getImage()
   {
      if( captureState==false ) {
         captureState = true;
         var rect = vid.getBoundingClientRect();
         canvas.width = rect.width;
         canvas.height = rect.height;
         var ctx = canvas.getContext('2d');
         ctx.setTransform(-1,0,0,1,canvas.width,0);
         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
         const dataURL = canvas.toDataURL("image/png");
         image.setAttribute('src', dataURL);
         stopAudio();
         stopVideo();
         video.style.display="none";
         image.style.display="block";
         getimgbtn.children[0].src = "/play-pause.png";
         downimgbtn.disabled=false;
      }
      else {
         captureState = false;
         initVideo();
         video.style.display="block";
         image.style.display="none";
         getimgbtn.children[0].src="/play-pause.png";
         downimgbtn.disabled=true;
      }
   }
   function downloadImage()
   {
      var a = document.createElement('a');
      a.download = 'myimage.png';
      a.href = image.src;
      a.click();
   }
   function fullscreen()
   {
      if( !isfullscreen ) {
         isfullscreen=true;
         fullElem.children[0].src="/expand.png";
         image.classList.add("fullscreen");
         video.classList.add("fullscreen");
         bar.style.setProperty("bottom","0");
         bar.style.setProperty("position","fixed");
         document.body.style.overflow = 'hidden';
      }
      else {
         isfullscreen=false;
         fullElem.children[0].src="/expand.png";
         image.classList.remove("fullscreen");
         video.classList.remove("fullscreen");
         bar.style.setProperty("bottom","unset");
         bar.style.setProperty("position","relative");
         document.body.style.overflow = 'visible';
      }
   }
   function visualize(stream) {
      var audioCtx=0;
      if(!audioCtx) {
         audioCtx = new AudioContext();
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      draw()

      function draw() {
         const WIDTH = miccan.width
         const HEIGHT = miccan.height;
         requestAnimationFrame(draw);
         analyser.getByteTimeDomainData(dataArray);
         miccanCtx.fillStyle = 'rgb(200, 200, 200)';
         miccanCtx.fillRect(0, 0, WIDTH, HEIGHT);
         miccanCtx.lineWidth = 2;
         miccanCtx.strokeStyle = 'rgb(0, 0, 0)';
         miccanCtx.beginPath();
         let sliceWidth = WIDTH * 1.0 / bufferLength;
         let x = 0;
         for(let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT/2;
            if(i === 0) {
               miccanCtx.moveTo(x, y);
            } else {
               miccanCtx.lineTo(x, y);
            }
            x += sliceWidth;
         }

         miccanCtx.lineTo(miccan.width, miccan.height/2);
         miccanCtx.stroke();
      }
    }
