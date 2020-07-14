// URLs for the data
var EarthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"
var PlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Get data on the earthquakes and plates...
d3.json(EarthquakesURL, function(data) {
  GetPlate(data.features);
});

function GetPlate(quakesData) {
  d3.json(PlatesURL, function(data) {
    createFeatures(quakesData, data.features);
  });
}

// define colors for earthquakes with a magnitude of "d"
function getColor(d) {
	return d >= 7 ? '#800026' :
	       d >= 6 ? '#bd0026' :
	       d >= 5 ? '#e31a1c' :
	       d >= 4 ? '#fc4e2a' :
	       d >= 3 ? '#fd8d3c' :
         d >= 2 ? '#ffff33' :
                  '#41ab5d' ;
}

// radius of the circles 
function getRadius (magnitude) {
  return (magnitude) * 25000;
}

// Create the map
function createFeatures(earthquakeData, platesData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the magnitude, place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + "Magnatude: " + feature.properties.mag + "<hr>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // GeoJSON layer containing the earthquakeData
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5}
      )}
  });

  // Create a GeoJSON layer containing the platesData
  var plates = L.geoJson(platesData, {
    style: function (feature) {
      var latlngs = (feature.geometry.coordinates);
      return L.polyline(latlngs, {color:'red'});
   }});

  // earthquakes and plates using the createMap function
  createMap(earthquakes, plates);
}
function createMap(earthquakes, plates) {

  // Define the satellite, outdoors and light map layers...

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
  
  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });
  
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellitemap,
    "Outdoors Map": outdoorsmap,
    "Grayscale Map": lightmap
  };

  // overlay layers..
  var overlayMaps = {Earthquakes: earthquakes, Plates: plates};

  // Create the map..
  var myMap = L.map("map", {
    center: [20, -10],
    zoom: 2,
    layers: [satellitemap, earthquakes, plates]
  });

  // layer controls..
    L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// map legend..
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {
  var div = L.DomUtil.create('div', 'info legend'),

// legend categories..
  categories = [0,2,3,4,5,6];

  // for each "category", add a color row..
  for (var i = 0; i < categories.length; i++) {

    div.innerHTML += 
      '<i style="background:' + getColor(categories[i]) + '"></i> ' +
        categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+');
  }
  return div;
  };

legend.addTo(myMap);
}