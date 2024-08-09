<?php

$countryName = isset($_GET['countryName']) ? $_GET['countryName'] : 'United Kingdom';
$searchQuery = urlencode($countryName);
$wiki_url = "https://en.wikipedia.org/w/api.php?action=opensearch&search={$searchQuery}";

$response = file_get_contents($wiki_url);
$data = json_decode($response, true);

$links = $data[3];

header('Content-Type: application/json');

echo json_encode(array_values($links));
