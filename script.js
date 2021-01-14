var canvas = document.getElementById("snapshot-1");
var context = canvas.getContext("2d");

// var canvas2 = document.getElementById("snapshot-2")
// var context2 = canvas2.getContext("2d")

const video = document.querySelector("#myVidPlayer");

var w, h;
canvas.style.display = "none";
// canvas2.style.display = "none"

// function dataURLtoFile(dataurl, filename) {
//     var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//     while(n--){
//         u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new File([u8arr], filename, {type:mime});
// }
// function b64toBlob(dataURI) {

//   var byteString = atob(dataURI.split(',')[1]);
//   var ab = new ArrayBuffer(byteString.length);
//   var ia = new Uint8Array(ab);

//   for (var i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }
//   return new Blob([ab], { type: 'image/jpeg' });
// }

function snapshot() {
  context.fillRect(0, 0, w, h);
  context.drawImage(video, 0, 0, w, h);
  canvas.style.display = "block";

  var dataURL = canvas.toDataURL("image/jpeg", 0.5); // converts snapshot to base64
  console.log(dataURL);
  // var imageFile = b64toBlob(dataURL)

  // var imageFile = atob(dataURL);
  // var imageFile = dataURLtoFile(dataURL, "photo.jpeg");

  // var imageFile = Buffer.from(dataURL, 'base64')

  // canvas.toBlob(function (blob) {
  // preparing to make post request to custom vision model
  fetch(dataURL)
    .then((res) => res.blob())
    .then((blob) => {
      console.log(blob);
      var url = window.URL.createObjectURL(blob);
      var myHeaders = new Headers();
      myHeaders.append("Prediction-Key", "7a5b384c2a3041f2a998bf8d0f68a85a");
      myHeaders.append("Content-Body", "application/json");
      myHeaders.append("Content-Type", "application/octet-stream");

      var raw = JSON.stringify({ Url: blob });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      // make post request to custom vision model
      fetch(
        "https://engauge.cognitiveservices.azure.com/customvision/v3.0/Prediction/b2f0ff86-4d04-43b3-a17b-91223e124ea6/classify/iterations/Iteration2/url",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          // display results on webpage and console
          console.log(result);
          document.getElementById("returned-data").innerHTML = result;
        })
        .catch((error) => console.log("error", error));
    });
  // }, 'image/jpeg', 0.50)
}

window.navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
      video.play();

      w = video.videoWidth;
      h = video.videoHeight;

      canvas.width = w;
      canvas.height = h;
    };
  })
  .catch((error) => {
    alert("You have to enable the mic and the camera");
  });
