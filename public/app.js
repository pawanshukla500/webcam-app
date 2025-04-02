// Get the video element
const videoElement = document.getElementById('video');
const startBtn = document.getElementById('startbutton');
const stopBtn = document.getElementById('endbutton');
const statusElem = document.getElementById('status');

// Start recording function
async function startRecording() {
  const trackingId = document.getElementById('trackingId').value.trim();
  if (!trackingId) {
    alert('Please enter a tracking ID!');
    return;
  }

  try {
    // Access webcam using getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Attach the webcam stream to the video element
    console.log("Webcam stream is being assigned to the video element");
    videoElement.srcObject = stream;

    // Debugging: Log the video element
    console.log(videoElement);
    
    // Make sure the video is playing
    videoElement.play();
    
    // Continue with your recording logic...
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    let recordedChunks = [];

    mediaRecorder.ondataavailable = event => {
      recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      uploadVideoToFirebase(blob, trackingId);
    };

    mediaRecorder.start();
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
    statusElem.textContent = "Status: Recording";

  } catch (err) {
    console.log("Error accessing webcam: ", err);
    statusElem.textContent = "Error accessing webcam.";
  }
}

// Stop recording function
function stopRecording() {
  const tracks = videoElement.srcObject.getTracks();
  tracks.forEach(track => track.stop());  // Stop all tracks
  startBtn.style.display = "block";
  stopBtn.style.display = "none";
  statusElem.textContent = "Status: Stopped";
}

// Upload video to Firebase (add your firebase logic)
function uploadVideoToFirebase(blob, trackingId) {
  const fileName = `${trackingId}.webm`;
  const videoRef = ref(storage, 'videos/' + fileName);
  uploadBytes(videoRef, blob).then(snapshot => {
    const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/videos%2F${fileName}?alt=media`;
    console.log("Video uploaded successfully: ", videoUrl);
    statusElem.textContent = "Video uploaded successfully!";
  }).catch(error => {
    console.log("Error uploading video: ", error);
    statusElem.textContent = "Error uploading video.";
  });
}

// Event listeners for start and stop buttons
startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
