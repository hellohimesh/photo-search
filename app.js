// Function to handle image selection and preview
let base64 = "";
function handleImageSelection() {
    const fileInput = document.getElementById('imageInput');
   

    fileInput.addEventListener('change',async function() {
        const file = fileInput.files[0];
        const reader = new FileReader();
        base64 = await getBase64Image(file);
       
        document.getElementById("imgPreview").innerHTML = `<img src="data:image/png;base64,${base64}" class="img-thumbnail" width="300" />`;
        // reader.onload = function(e) {
        //     imagePreview.src = e.target.result;
        // };

        // reader.readAsDataURL(file);
    });
}

// Function to handle the search button click
function handleSearchButtonClick() {
    const searchButton = document.getElementById('searchButton');
    const imageInput = document.getElementById('imageInput');

    searchButton.addEventListener('click', async function() {
        const file = imageInput.files[0];
        if (!file && base64 == "") {
            alert('Please select an image first.');
            return;
        }
        if(file) { base64 = await getBase64Image(file);}

        // Make API call to the server
        const response = await makeApiCall(base64);

        // Display the response
        displayResponse(response);
    });
}

// Function to convert image to Base64
function getBase64Image(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function() {
            resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(file);
    });
}

// Function to make API call
function makeApiCall(base64Image) {
    const apiUrl = '/face/search'; // Replace this with the actual API URL
    const url = document.getElementById("urlInput").value;
    return fetch(url+apiUrl, {
        method: 'POST',
        // headers: {
        //     'Content-Type': 'application/json',
        // },
        body: JSON.stringify({
            image: base64Image,
        }),
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to display the response
function displayResponse(response) {
    const resultsList = document.getElementById('resultsList');

    // Clear previous results
    resultsList.innerHTML = '';

    if (!response || !response.message || !Array.isArray(response.message)) {
        resultsList.innerHTML = '<li class="list-group-item">No results found.</li>';
        return;
    }

    // Populate the results list
    response.message.forEach((name) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = name;
        resultsList.appendChild(listItem);
    });
}

// Main function to initialize the app
function initApp() {
    handleImageSelection();
    handleSearchButtonClick();
}
function capturePhoto() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Access the device camera and capture a photo
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement('video');
          const imagePreview = document.getElementById("imgPreview");
          imagePreview.innerHTML = "";
          imagePreview.appendChild(video);
  
          video.srcObject = stream;
          video.onloadedmetadata = function () {
            video.play();
          };
  
          // Capture the photo when the video stream is ready
          video.addEventListener('click', function () {
            document.getElementById('imageInput').value = "";
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  
            const base64Image = canvas.toDataURL('image/jpeg');
            displayImagePreview(base64Image);
          //  makeAPICall(base64Image);
  
            // Stop the video stream after capturing the photo
            stream.getTracks().forEach((track) => track.stop());
          });
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    } else {
      alert('Camera access not available in this browser.');
    }
  }
  function displayImagePreview(base64Image) {
    base64 = base64Image;
    document.getElementById("imgPreview").innerHTML = `<img src="${base64Image}" class="img-thumbnail" width="300" />`;
    base64 = base64Image.split(',')[1];
  }
// Call the main function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
