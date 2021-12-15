import colorPaletteJson from '/public/data/color-palette.json';

const getColorForSkinId = (skinId, palette = 'fitzpatrick') => {
  return colorPaletteJson.skintones[palette][parseInt(skinId) - 1];
}

const getColorPaletteSkintones = (palette = 'fitzpatrick') => {
  return colorPaletteJson.skintones[palette];
}

export default {
  getColorForSkinId,
  getColorPaletteSkintones
}