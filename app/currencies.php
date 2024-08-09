<?php

$currencies_url = "https://restcountries.com/v3.1/all?fields=currencies";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $currencies_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);
$currencyData = array();
foreach ($data as $item) {
    foreach ($item['currencies'] as $currencyCode => $currencyInfo) {
        $currencyData[] = array(
            'code' => $currencyCode,
            'name' => $currencyInfo['name']
        );
    }
}

echo json_encode($currencyData);
curl_close($ch);

?>