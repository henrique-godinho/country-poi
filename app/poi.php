<?php

function fetchPoiData($countryCode)
{
    $api_key= "5ae2e3f221c38a28845f05b6e4eed95d810cbb64f26d14d1b7f10079";

    $bbox_json = file_get_contents('../bbox.json');
    $data = json_decode($bbox_json);

    $countryCode = isset($_GET['countryCode']) ? $_GET['countryCode'] : 'gb';

    $lat_min = $data->$countryCode->boundingBox->sw->lat;
    $lon_min = $data->$countryCode->boundingBox->sw->lon;
    $lat_max = $data->$countryCode->boundingBox->ne->lat;
    $lon_max = $data->$countryCode->boundingBox->ne->lon;

    $rate = "3";
    $kinds = "interesting_places";

    $url = "https://api.opentripmap.com/0.1/en/places/bbox?lon_min={$lon_min}&lat_min={$lat_min}&lon_max={$lon_max}&lat_max={$lat_max}&kinds={$kinds}&src_geom=wikidata&src_attr=wikidata&rate={$rate}&limit=50&apikey={$api_key}";


    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $responseObject = json_decode($response);
    $features = $responseObject->features;

    foreach($features as $feature)
    {
        $name = $feature->properties->name;
        $item_lat = $feature->geometry->coordinates[0];
        $item_lon = $feature->geometry->coordinates[1];
        $wikidata_id = $feature->properties->wikidata;
    
        $item = [
            //"name" => $name,
            //"lat" => $item_lat,
            //"lon" => $item_lon,
            "wikiId" => $wikidata_id

        ];

        $items[] = $item;
    } 

    curl_close($ch);
    return $items;
}

?>