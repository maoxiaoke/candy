export const defaultSettings = {
  renameAfterDownload: true,
  // getResponseWhenContextMenuShown: true,
};

export const getSettings = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(defaultSettings, (items) => {
      resolve(items);
    });
  });
};
