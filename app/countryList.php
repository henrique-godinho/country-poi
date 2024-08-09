<?php
    $jsonCountry = file_get_contents('../countryBorders.geo.json');

    $data = json_decode($jsonCountry, true);

    if (isset($data['features'])) {
        foreach ($data['features'] as $feature) {
            if (isset($feature['properties']['name'])) {
                $name = $feature['properties']['name'];
    
                // Output the value
                $countryNames[] = $name;
            }
        }
    }
    sort($countryNames);
    echo json_encode($countryNames);