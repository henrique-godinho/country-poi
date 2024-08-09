<?php
//session_start();

$iso_a2 = null;

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (isset($data['country'])) {
        $country = $data['country'];

        $jsonCountry = file_get_contents('../countryBorders.geo.json');
        $geoData = json_decode($jsonCountry, true);

        

        if (isset($geoData['features'])) {
            foreach ($geoData['features'] as $feature) {
                if (isset($feature['properties']['name']) && $feature['properties']['name'] === $country) {
                    $iso_a2 = $feature['properties']['iso_a2'];
                    break;
                }
            }
        }

       // $_SESSION['iso_a2'] = $iso_a2;

        // Make API call to weather.php with country code as a query parameter
        $weatherUrl = "http://localhost/project1/app/weather.php?iso_a2={$iso_a2}";
    
        $ch = curl_init($weatherUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);

        header('Content-Type: application/json');
        echo json_encode($iso_a2);

        
    } else {
        echo 'Country not provided';
    }
?>