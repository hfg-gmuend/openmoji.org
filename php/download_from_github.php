<?php

// fetch emoji hexcode and color variant
$emoji_hexcode = $_GET["emoji_hexcode"];
$emoji_variant = $_GET["emoji_variant"];

// build remote file url
$file_url  = "https://github.com/hfg-gmuend/openmoji/raw/master/" . $emoji_variant . "/618x618/" . $emoji_hexcode . ".png";

// set headers
header("Content-Type: application/octet-stream");
header("Content-Transfer-Encoding: Binary"); 
header("Content-disposition: attachment; filename=\"" . $emoji_hexcode . "_" . $emoji_variant . ".png\"");

// read file from url
readfile($file_url);

exit;