<?php

// turn off all error reporting
error_reporting(0);

$asset_type = $_GET["type"] ?? null;

switch ($asset_type) {
  case "emoji":
    // fetch emoji hexcode and color variant
    $emoji_hexcode = $_GET["emoji_hexcode"];
    $emoji_variant = $_GET["emoji_variant"];

    if (!$emoji_hexcode || !$emoji_variant) {
        break;
    }

    // build remote file url
    $file_url  = "https://github.com/hfg-gmuend/openmoji/raw/master/" . $emoji_variant . "/618x618/" . $emoji_hexcode . ".png";

    // set headers
    header("Content-Type: application/octet-stream");
    header("Content-Transfer-Encoding: Binary");
    header("Content-disposition: attachment; filename=\"" . $emoji_hexcode . "_" . $emoji_variant . ".png\"");

    // read file from url
    readfile($file_url);

    exit;

  case "url":
    // fetch asset url and filename
    $asset_url = $_GET["target_url"];

    if (!$asset_url) {
        break;
    }

    // check if asset url is whitelisted
    $WHITELISTED_URLS = [
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-abc.svg",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-color-palette.svg",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-color-palette-inkscape.gpl",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-color-palette-adobe-illustrator.ase",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-template.svg",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/guidelines/openmoji-template.ai",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/font/OpenMoji-Black.ttf",
      "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/font/OpenMoji-Color.ttf"
    ];
    if (!in_array($asset_url, $WHITELISTED_URLS)) {
        break;
    }

    $tmp_filename = explode('/', $asset_url);
    $filename = array_pop($tmp_filename);

    // set headers
    header("Content-Type: application/octet-stream");
    header("Content-Transfer-Encoding: Binary");
    header("Content-disposition: attachment; filename=\"" . $filename . "\"");

    // read asset from url
    readfile($asset_url);

    exit;
}

// inform client that no matching file was found and nothing can be downloaded
header("HTTP/1.0 204 No Content", true, 204);

exit;
