<?php
session_start();

$iso_a2 = isset($_GET['iso_a2']) ? $_GET['iso_a2'] : 'GB';

$lat = null;
$lon = null;

$apiKey ="b65c07fdd02e975846dcd6b46794ab1d";
$restcountry_url = "https://restcountries.com/v3.1/alpha/{$iso_a2}";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $restcountry_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);



if ($response !== false) {
    $data = json_decode($response, true);

    if (isset($data[0]['latlng']) && is_array($data[0]['latlng']) && count($data[0]['latlng']) === 2) {
        $lat = $data[0]['latlng'][0];
        $lon = $data[0]['latlng'][1];

        $coord_url = "https://api.openweathermap.org/data/3.0/onecall?lat={$lat}&lon={$lon}&eclude=hourly,minutely&appid={$apiKey}&units=metric";

        $curl = curl_init($coord_url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($curl);
    
        if ($response) {
            echo $response;
        } else {
            echo "Failed to retrieve weather data.";
        }
    
        curl_close($curl);
    } else {
        echo "Latitude and longitude data not found.";
    }
       
}

curl_close($ch);

