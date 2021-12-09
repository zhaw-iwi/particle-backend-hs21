var rootUrl = window.location.origin; // get the root URL, e.g. https://example.herokuapp.com or http://localhost:3001



async function getResult() {
    var dbName = document.getElementById("db").value;
    var collectionName = document.getElementById("collection").value;
    var query = document.getElementById("query").value;


    // e.g. http://localhost:3001/api/MyDB/MotionDetected?timestamp=13:00
    var url = rootUrl + "/api/" + dbName + "/" + collectionName +"?" + query; 

    var response = await axios.get(url);
    
    var result = response.data;

    // update the html element
    document.getElementById("result").innerHTML = JSON.stringify(result);
}
