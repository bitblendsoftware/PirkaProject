// -----------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------
// Map creation
let map = L.map('map').fitWorld();

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`

const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const osmURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
// const osmURL = "https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png";

const orm = L.tileLayer(osmURL, {
  attribution
}).addTo(map);

//Plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls

const osm2 = new L.TileLayer(osmURL, {
  minZoom: 0,
  maxZoom: 13,
  attribution
});
const miniMap = new L.Control.MiniMap(osm2, {
  toggleDisplay: true
}).addTo(map);


map.locate({
  setView: true,
  maxZoom: 7
});

function onLocationFound(e) {
  var radius = e.accuracy;

  L.marker(e.latlng).addTo(map)
    .bindPopup("Your location").openPopup();

  // L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);


function onLocationError(e) {
  alert(e.message);
}

map.on('locationerror', onLocationError);


// -----------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------
// obtaining coordinates after clicking on the map
map.on("click", function(e) {
  const markerPlace = document.querySelector(".marker-position");
  markerPlace.textContent = e.latlng;
});



// -----------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------
// create custom location button
const customControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
    className: "locate-button leaflet-bar",
    html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
    style: "margin-top: 0; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;",
  },
  // method
  onAdd: function(map) {
    this._map = map;
    const button = L.DomUtil.create("div");
    L.DomEvent.disableClickPropagation(button);

    button.title = "locate";
    button.innerHTML = this.options.html;
    button.className = this.options.className;
    button.setAttribute("style", this.options.style);

    L.DomEvent.on(button, "click", this._clicked, this);

    return button;
  },
  _clicked: function(e) {
    L.DomEvent.stopPropagation(e);

    // this.removeLocate();

    this._checkLocate();

    return;
  },
  _checkLocate: function() {
    return this._locateMap();
  },

  _locateMap: function() {
    const locateActive = document.querySelector(".locate-button");
    const locate = locateActive.classList.contains("locate-active");
    // add/remove class from locate button
    locateActive.classList[locate ? "remove" : "add"]("locate-active");

    // remove class from button
    // and stop watching location
    if (locate) {
      this.removeLocate();
      this._map.stopLocate();
      return;
    }

    // location on found
    this._map.on("locationfound", this.onLocationFound, this);
    // locataion on error
    this._map.on("locationerror", this.onLocationError, this);

    // start locate
    this._map.locate({
      setView: true,
      enableHighAccuracy: true
    });
  },
  onLocationFound: function(e) {
    // add circle
    this.addCircle(e).addTo(this.featureGroup()).addTo(map);

    // add marker
    this.addMarker(e).addTo(this.featureGroup()).addTo(map);

    // add legend
  },
  // on location error
  onLocationError: function(e) {
    this.addLegend("Location access denied.");
  },
  // feature group
  featureGroup: function() {
    return new L.FeatureGroup();
  },
  // add legend
  addLegend: function(text) {
    const checkIfDescriotnExist = document.querySelector(".description");

    if (checkIfDescriotnExist) {
      checkIfDescriotnExist.textContent = text;
      return;
    }

    const legend = L.control({
      position: "bottomleft"
    });

    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "description");
      L.DomEvent.disableClickPropagation(div);
      const textInfo = text;
      div.insertAdjacentHTML("beforeend", textInfo);
      return div;
    };
    legend.addTo(this._map);
  },
  addCircle: function({
    accuracy,
    latitude,
    longitude
  }) {
    return L.circle([latitude, longitude], accuracy / 2, {
      className: "circle-test",
      weight: 2,
      stroke: false,
      fillColor: "#136aec",
      fillOpacity: 0.15,
    });
  },
  addMarker: function({
    latitude,
    longitude
  }) {
    return L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: "located-animation",
        iconSize: L.point(17, 17),
        popupAnchor: [0, -15],
      }),
    }).bindPopup("Your are here :)");
  },
  removeLocate: function() {
    this._map.eachLayer(function(layer) {
      if (layer instanceof L.Marker) {
        const {
          icon
        } = layer.options;
        if (icon?.options.className === "located-animation") {
          map.removeLayer(layer);
        }
      }
      if (layer instanceof L.Circle) {
        if (layer.options.className === "circle-test") {
          map.removeLayer(layer);
        }
      }
    });
  },
});

// adding new button to map controll
map.addControl(new customControl());



// -----------------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------
// MARKERS Latitud eje Y longitud eje X, en ese orden se pasan como parametro
// L.marker([-37.889923, -58.265049]).addTo(map).bindPopup("La Barrosa");

// coordinate array with popup text
const points = [
  [-37.889923, -58.265049, "La Barrosa", 14]
];


// Itera los marcadores agregados dinamicamente desde el array "points"
// los agrega a la lista del side bar y los hace clickeables para que de la lista salte al mapa con zoom
const routeList = document.querySelector(".routes");
const featureGroups = [];
for (let i = 0; i < points.length; i++) {
  const [lat, lng, title, zoom] = points[i];

  const marker = L.marker([lat, lng], {
    title
  });
  marker
    .bindPopup(title)
    .addTo(map)
    .on("click", doSomething);

  const el = document.createElement("a");
  el.id = marker._leaflet_id;
  el.className = "marker-click";
  el.href = "#";
  el.textContent = title;
  routeList.appendChild(el);
  el.addEventListener("click", (e) => {
    map.setView([lat, lng], zoom);
  });
}


// set center map
function doSomething(e) {
  // map.setView(e.target.getLatLng(), 15);
}