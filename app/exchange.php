<?php

$code = isset($_GET['code']) ? $_GET['code'] : 'GBP';
$appId ="7dde5ae184d04a609095ceff05411fef";

$fx_url = "https://openexchangerates.org/api/latest.json?app_id={$appId}";


$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $fx_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response);

$base = $data->base;
$fx = $data->rates->$code;
$rates = $data->rates;

header('Content-Type: application/json');
$data = [
    "currencyCode" => $code,
    "exchange" => $fx,
    "rates" => $rates
];
echo json_encode($data);
curl_close($ch);