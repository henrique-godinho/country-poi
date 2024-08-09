<?php
require 'poi.php';

$countryCode = isset($_GET['countryCode']) ? $_GET['countryCode'] : 'gb';

$poiData = fetchPoiData($countryCode);

$wikidataIds = [];


foreach ($poiData as $item) {
    $wikidataIds[] = $item['wikiId'];

}

// Build the URL with all the IDs
$idsQueryString = implode('|', $wikidataIds);
$url = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids={$idsQueryString}&props=sitelinks|sitelinks/urls|claims&sitefilter=enwiki&languages=en&redirects=yes";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);

curl_close($ch);

$validEntities = [];

foreach ($data['entities'] as $entityId => $entity) {
    if (isset($entity['redirects'])) {
        continue; // Skip redirects
    }

    
    if (!empty($entity['sitelinks']) && isset($entity['claims']['P625'])) {
        $validEntities[] = [
            "lat" => $entity['claims']['P625'][0]['mainsnak']['datavalue']['value']['latitude'], // Get latitudes
            "lon" => $entity['claims']['P625'][0]['mainsnak']['datavalue']['value']['longitude'], // Get longitudes
            "entity" => $entity
        ];

    }
}

header('Content-Type: application/json');
echo json_encode($validEntities);
?>
