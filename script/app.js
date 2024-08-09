// populates the menu with country names from php routine.
let selectedCountry = '';
var map;
window.onload = function () {
    fetch('./app/countryList.php')
        .then(response => response.json())
        .then(data => {
            const countryList = data;

            countryList.forEach(item => {
               let countryOptions = document.getElementById('countryOptions');
               let countries = document.createElement('option');
               countries.innerText = item;
               countries.value = item;
               countryOptions.appendChild(countries);             
            });
        })
        .catch(error => {
            console.error(error);
        })                   
        currentRegion();
  		mapUpdate();
}

// Collect the user's current location to set in the Map initialization function
// Defaults to London if user denies access to their location.
navigator.geolocation.getCurrentPosition( position => {
    
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    initMap(latitude, longitude);

},
    error => {
        if(error.code === error.PERMISSION_DENIED) {
            latitude = 51.505;
            longitude = -0.09

            initMap(latitude, longitude);
        }
    });


// Initiates the Map with coordinates from getCurrentPosition()
// Removes the default zoom control from the top left and add to the top right to free the dropdown menu
function initMap(latitude, longitude) {

    map = L.map('map').setView([latitude, longitude], 7);
    map.removeControl(map.zoomControl);
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

}

// Allows user to set a map theme (dark or light tile) via toggle button
function mapTheme() {
    let mapTile = '';
    let mapTheme = document.getElementById('flexSwitchCheckDefault');

    if(mapTheme.checked) {
        mapTile = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else {
        mapTile = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }

    tileLayer.setUrl(mapTile);
    
 
}
/* var toggleButton = document.getElementById('flexSwitchCheckDefault');
toggleButton.addEventListener('change', mapTheme); */

var country;

function mapUpdate() {
var countryOptions = document.querySelector('#countryOptions');
var previousLayer = null;
countryOptions.addEventListener('change', (event) => {
    country = event.target.value;

    fetch('./app/coordinates.php',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'country': country}),
    }).then(response => response.json())
        .then(data => {
            let geoJson = {
                type: 'FeatureCollection',
                features: [data],
                
            }

            if(previousLayer) {
              map.removeLayer(previousLayer);
            }

            let layer = L.geoJSON(geoJson, {
              style: {
                color: 'red',
                weight: 1,
                opacity: 1,
                fill: false,
              },
            }).addTo(map);

            previousLayer = layer;

            let bounds = layer.getBounds();
            
            map.fitBounds(bounds);
  
            countryDetails(country);
        })

        .catch(error => {
            console.log(error);
        })
    });
}

function countryDetails(countryName) {
    fetch('./app/countryCode.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'country': countryName }),
    })
      .then(response => response.json())
      .then(data => {
        countryCode = data;
        return fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      })
      .then(response => response.json())
      .then(data => {
        countryData = data[0];
  
        let capital = document.getElementById('capital');
        let country_code = document.getElementById('country_code');
        let population = document.getElementById('population');
        let currency_name = document.getElementById('currency_name');
        let currency_symbol = document.getElementById('currency_symbol');
        let languages = document.getElementById('languages');
        let flag = document.getElementById('flag');
  
        if (countryData) {
          let currencyCode = Object.keys(countryData.currencies);
          let currencyList = currencyCode.map(code => countryData.currencies[code]);
          let currencyNames = currencyList.map(currency => currency.name).join(', ');
          let currencySymbols =  currencyList.map(currency => currency.symbol).join(', ');
          let languageCode = Object.keys(countryData.languages);
          let languageList = languageCode.map(code => countryData.languages[code]).join(', ');
  
          capital.innerText = countryData.capital;
          country_code.innerText = countryData.cca2;
          population.innerText = countryData.population.toLocaleString();
          currency_name.innerText = currencyNames;
          currency_symbol.innerText = currencySymbols;
          languages.innerText = languageList;
          flag.src = countryData.flags.png;

          weather(countryCode);
          currency(currencyCode[0]);
          poi(countryCode);
        }
        
        
      })
      .catch(error => {
        console.log(error);
      });
  }

  function weather(iso_a2) { 
    fetch(`./app/weather.php?iso_a2=${iso_a2}`)
      .then(response => response.json())
      .then(data => {
        let weather = data;
  
        let temperature = document.getElementById('todayMaxTemp');
        temperature.innerText = parseInt(weather.current.temp) + '\u00B0';
  
        let weatherIcon = document.getElementById('todayIcon');
        let icon = weather.current.weather[0].icon;
        let iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
        weatherIcon.src = iconUrl;
  
        let weatherDescription = document.getElementById('todayConditions');
        weatherDescription.innerText = weather.current.weather[0].description;
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        //Forcast 1st day
        let day0 = document.getElementById('day0');
        let dt0 = new Date(weather.daily[0].dt * 1000);
        let dayIndex = dt0.getDay();
        let dayName = dayNames[dayIndex];
        day0.innerText = dayName;


        let temp0 = document.getElementById('temp0');
        temp0.innerText = parseInt(weather.daily[0].temp.day) + '\u00B0';
        
        let icon0 = document.getElementById('icon0');
        let icon0icon = weather.daily[0].weather[0].icon;
        let icon0Url = `https://openweathermap.org/img/wn/${icon0icon}.png`;
        icon0.src = icon0Url;

        //Forecast 2nd
        let day1 = document.getElementById('day1');
        let dt1 = new Date(weather.daily[1].dt * 1000);
        dayIndex = dt1.getDay();
        dayName = dayNames[dayIndex];
        day1.innerText = dayName;


        let temp1 = document.getElementById('temp1');
        temp1.innerText = parseInt(weather.daily[1].temp.day)+ '\u00B0';
        
        let icon1 = document.getElementById('icon1');
        let icon1icon = weather.daily[1].weather[0].icon;
        let icon1Url = `https://openweathermap.org/img/wn/${icon1icon}.png`;
        icon1.src = icon1Url;

        //Forecast 3rd Day
        let day2 = document.getElementById('day2');
        let dt2 = new Date(weather.daily[2].dt * 1000);
        dayIndex = dt2.getDay();
        dayName = dayNames[dayIndex];
        day2.innerText = dayName;


        let temp2 = document.getElementById('temp2');
        temp2.innerText = parseInt(weather.daily[2].temp.day)+ '\u00B0';
        
        let icon2 = document.getElementById('icon2');
        let icon2icon = weather.daily[2].weather[0].icon;
        let icon2Url = `https://openweathermap.org/img/wn/${icon2icon}.png`;
        icon2.src = icon2Url;


        //Forecast 4th Day
        let day3 = document.getElementById('day3');
        let dt3 = new Date(weather.daily[3].dt * 1000);
        dayIndex = dt3.getDay();
        dayName = dayNames[dayIndex];
        day3.innerText = dayName;


        let temp3 = document.getElementById('temp3');
        temp3.innerText = parseInt(weather.daily[3].temp.day)+ '\u00B0';
        
        let icon3 = document.getElementById('icon3');
        let icon3icon = weather.daily[3].weather[0].icon;
        let icon3Url = `https://openweathermap.org/img/wn/${icon3icon}.png`;
        icon3.src = icon3Url;

        //Forecast 5th Day
        let day4 = document.getElementById('day4');
        let dt4 = new Date(weather.daily[4].dt * 1000);
        dayIndex = dt4.getDay();
        dayName = dayNames[dayIndex];
        day4.innerText = dayName;


        let temp4 = document.getElementById('temp4');
        temp4.innerText = parseInt(weather.daily[4].temp.day)+ '\u00B0';
        
        let icon4 = document.getElementById('icon4');
        let icon4icon = weather.daily[4].weather[0].icon;
        let icon4Url = `https://openweathermap.org/img/wn/${icon4icon}.png`;
        icon4.src = icon4Url;
      })
      .catch(error => {
        console.log(error);
      });
  }

function currentRegion() {
    fetch('https://ipapi.co/json/')
    .then(function(response) {
    response.json().then(jsonData => {
    let countryName = jsonData.country_name;
    let country = jsonData.country;
    let code = jsonData.currency;
    
    if(navigator.geolocation) {
      const countryValue = document.querySelector('#countryOptions');
      for(let option of countryValue.options) {
        if(option.value == countryName) {
          option.selected = true;
          countryValue.dispatchEvent(new Event('change'));
          break;
        }
      }
    }

    countryDetails(countryName)
    weather(country);
    currency(code);
  });
})
.catch(function(error) {
  console.log(error)
});
}

function currency(code) {
  const currencyOptions = document.getElementById("exchangeRate");


  fetch(`./app/exchange.php?code=${code}`)
    .then(response => response.json())
    .then(data => {
      const ratesJson = data['rates'];


      fetch("./app/currencies.php")
        .then(response => response.json())
        .then(currencyData => {
          // Clear the existing options in case this function is called again
          currencyOptions.innerHTML = '';

          // Loop through the currency codes and values
          Object.entries(ratesJson).forEach(([currencyCode, currencyValue]) => {
            // Find the corresponding currencyData entry by code
            const currencyInfo = currencyData.find(c => c.code === currencyCode);

            // If a matching currencyInfo is found, create the option
            if (currencyInfo) {
              let currency = document.createElement('option');
              currency.innerText = `${currencyCode} (${currencyInfo.name})`;
              currency.value = currencyValue;

              // Check if the code matches the selected code
              if (currencyCode === code) {
                currency.selected = true;
              }

              currencyOptions.appendChild(currency);
            }
          });
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });

    const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'));
    currencyModal._element.addEventListener('show.bs.modal', function () {
      calcResult();
    });
}

function calcResult(){
  
  let usdBaseAmount = document.getElementById('fromAmount');
  let result = document.getElementById('toAmount');
  let currencyOptions = document.getElementById('exchangeRate');
  let exchange;

  
  let currencyOptionValue = currencyOptions.options[currencyOptions.selectedIndex].value;
  exchange = usdBaseAmount.value * currencyOptionValue;
  result.value = exchange.toFixed(2);

  usdBaseAmount.addEventListener('keyup', function(){
    exchange = usdBaseAmount.value * currencyOptionValue;
    result.value = exchange.toFixed(2);
  });

  usdBaseAmount.addEventListener('change', function(){
    exchange = usdBaseAmount.value * currencyOptionValue;
    result.value = exchange.toFixed(2);
  });

  currencyOptions.addEventListener('change', function() {
    currencyOptionValue = currencyOptions.options[currencyOptions.selectedIndex].value;
    exchange = usdBaseAmount.value * currencyOptionValue;
    result.value = exchange.toFixed(2);
  });

}


var sitesIcon = L.ExtraMarkers.icon({
  prefix: 'fa',
  icon: 'fa-monument',
  iconColor: 'black',
  markerColor: 'white',
  shape: 'square'
});


function poi(countryCode) {
  let country_code_lower = countryCode.toLowerCase();
  let markers = [];

  fetch(`./app/poi.php?countryCode=${country_code_lower}`)
    .then(() => {
      fetch(`./app/wikidata.php?countryCode=${country_code_lower}`)
        .then(response => response.json())
        .then(data => {
          for (const entityId in data) {
            const item = data[entityId];
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${item.entity.sitelinks.enwiki.title}`;
            fetch(url)
              .then(response => {
                if (!response.ok) {
                  return null;
                }
                return response.json();
              })
              .then(wikipediaData => {
                if (!wikipediaData) {
                  return;
                }
                let popup_content = `
                  <h3>${wikipediaData.title}</h3>
                  <p>${wikipediaData.extract}</p>
                  <img src="${wikipediaData.thumbnail ? wikipediaData.thumbnail.source : ''}" alt="${wikipediaData.title}" width="100" height="100">
                  <a href="${wikipediaData.content_urls.mobile.page}">Wiki Page</a>
                `;
                const marker = L.marker([item.lat, item.lon], { icon: sitesIcon })
                  .bindPopup(popup_content, { maxWidth: 200 })
                  .addTo(map);
                markers.push(marker);
              });
          }
          document.querySelector('#countryOptions').addEventListener('change', function() {
            markers.forEach(marker => {
              marker.remove();
            });
          });
        });
    });
}
