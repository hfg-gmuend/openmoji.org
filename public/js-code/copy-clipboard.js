const copyTextToClipboard = function (content) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText#examples
  navigator.clipboard.writeText(content).then(
    () => {
      /* clipboard successfully set */
      console.log("copied '" + content + "'to clipboard.");
    },
    () => {
      /* clipboard write failed */
      console.error("copy '" + content + "'to clipboard failed.");
    }
  );
};

const copyImgURLAsImageToClipboard = async function (imgURL) {
  // based on https://web.dev/articles/async-clipboard
  try {
    console.log("imgURL", imgURL);
    const data = await fetch(imgURL);
    const blob = await data.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        // The key is determined dynamically based on the blob's type.
        [blob.type]: blob,
      }),
    ]);
    console.log("Image copied.");
  } catch (err) {
    console.error(err.name, err.message);
  }
};

export { copyTextToClipboard, copyImgURLAsImageToClipboard };
