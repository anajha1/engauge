var canvas = document.getElementById("snapshot-1");
var context = canvas.getContext("2d");

const video = document.querySelector("#myVidPlayer");

var w, h;
canvas.style.display = "none";

// converts base64 string to blob
function b64toBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: "image/jpeg" });
}

function snapshot() {
  context.fillRect(0, 0, w, h);
  context.drawImage(video, 0, 0, w, h);
  canvas.style.display = "block";

  var dataURL = canvas.toDataURL("image/jpeg", 0.5); // converts snapshot to base64, at medium quality
  // console.log(dataURL);

  var blob = dataURLtoFile(dataURL, "photo.jpeg"); // converts image (in base64 form) to blob

  var raw = JSON.stringify({ Url: blob }); // convert it to request-able body

  // preparing to make post request to custom vision model
  var myHeaders = new Headers();
  myHeaders.append("Prediction-Key", "7a5b384c2a3041f2a998bf8d0f68a85a");
  myHeaders.append("Content-Body", "application/json");
  myHeaders.append("Content-Type", "application/octet-stream");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  // make post request to custom vision model
  fetch(
    "https://engauge.cognitiveservices.azure.com/customvision/v3.0/Prediction/b2f0ff86-4d04-43b3-a17b-91223e124ea6/classify/iterations/Iteration5/url",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      // display results on webpage
      document.getElementById("returned-data").innerHTML = result;
    })
    .catch((error) => console.log("error", error));
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
