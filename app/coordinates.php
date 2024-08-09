<?php
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (isset($data['country'])) {
        $country = $data['country'];

        $jsonCountry = file_get_contents('../countryBorders.geo.json');
        $geoData = json_decode($jsonCountry, true);

        $coordinates = null;

        if (isset($geoData['features'])) {
            foreach ($geoData['features'] as $feature) {
                if (isset($feature['properties']['name']) && $feature['properties']['name'] === $country) {
                    $coordinates = $feature['geometry'];
                    break;
                }
            }
        }

        header('Content-Type: application/json');
        echo json_encode($coordinates);
    } else {
        echo 'No country specified.';
    }
?>
