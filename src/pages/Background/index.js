import { getSettings } from '../../utils/index';

const requestCaching = {};

const idleCallback = () => {};

const eventBus = new EventTarget();

function waitForResponse() {
  return new Promise((resolve, reject) => {
    function onMessage(event) {
      if (event.detail?.state === 'complete') {
        eventBus.removeEventListener('download-complete', onMessage);
        resolve(true);
      } else {
        eventBus.removeEventListener('download-complete', onMessage);
        reject(false);
      }
    }

    eventBus.addEventListener('download-complete', onMessage);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'candy-download-image',
    title: 'Download image with Candy',
    contexts: ['image'],
  });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { type, url } = message;
  if (type === 'imageRightClick') {
    if (requestCaching[url]) {
      return;
    }

    requestCaching[url] = {
      state: 'fetching',
      id: url,
    };

    const ot = await getGPT4oOutput(url);

    if (ot) {
      requestCaching[url] = {
        ...(requestCaching[url] ?? {}),
        state: 'fetched',
        ot,
      };
    }

    eventBus.dispatchEvent(
      new CustomEvent('get-ot', {
        detail: {
          id: url,
          ot: ot,
        },
      })
    );

    sendResponse({ received: true }); // 发送响应
  }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  const extension = downloadItem.filename.split('.').pop();

  let nameByAi = null;
  const cachingItem = requestCaching[downloadItem.url];
  if (cachingItem?.state === 'fetched') {
    nameByAi = cachingItem.ot;
  }

  if (extension && requestCaching[downloadItem.url]) {
    requestCaching[downloadItem.url].extension = extension;
  }

  if (nameByAi && extension) {
    suggest({
      filename: `${nameByAi}.${extension}`,
    });
    return;
  }

  suggest();
});

chrome.downloads.onChanged.addListener((delta) => {
  Object.keys(requestCaching).forEach((key) => {
    if (requestCaching[key].downloadId === delta.id) {
      const cachingItem = requestCaching[key];
      cachingItem.originFileState = delta?.state
        ? delta.state.current
        : cachingItem.state;

      if (delta.state?.current === 'complete') {
        eventBus.dispatchEvent(
          new CustomEvent('download-complete', {
            detail: {
              state: 'complete',
            },
          })
        );
      }

      if (delta.state?.current === 'interrupted') {
        eventBus.dispatchEvent(
          new CustomEvent('download-complete', {
            detail: {
              state: 'interrupted',
            },
          })
        );
      }
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'candy-download-image') {
    const { renameAfterDownload = true } = await getSettings();

    if (renameAfterDownload) {
      await getCachingOut(info.srcUrl);
    } else {
      getCachingOut(info.srcUrl).then(async (ot) => {
        if (!ot) {
          return;
        }

        const { originFileState, downloadId, extension } =
          requestCaching[info.srcUrl] ?? {};

        if (originFileState === 'complete') {
          chrome.downloads.search({ id: downloadId }, (items) => {
            chrome.downloads.removeFile(downloadId, idleCallback);
            chrome.downloads.erase({ id: downloadId }, idleCallback);

            chrome.downloads.download(
              {
                url: info.srcUrl,
                filename: `${ot}.${extension}`,
                saveAs: false,
              },
              idleCallback
            );
          });
        } else {
          try {
            await waitForResponse();

            chrome.downloads.search({ id: downloadId }, (items) => {
              chrome.downloads.removeFile(downloadId, idleCallback);
              chrome.downloads.erase({ id: downloadId }, idleCallback);

              chrome.downloads.download(
                {
                  url: info.srcUrl,
                  filename: `${ot}.${extension}`,
                  saveAs: false,
                },
                idleCallback
              );
            });
          } catch (e) {
            // Download interrupted by user or cause error
          }
        }
      });
    }

    chrome.downloads.download(
      {
        url: info.srcUrl,
        saveAs: true,
      },
      (id) => {
        if (requestCaching[info.srcUrl]) {
          requestCaching[info.srcUrl].downloadId = id;
        }
      }
    );
  }
});

async function getCachingOut(imageUrl) {
  if (requestCaching[imageUrl]) {
    const cachingItem = requestCaching[imageUrl];
    if (cachingItem?.state === 'fetched') {
      return cachingItem.ot;
    }

    if (cachingItem?.state === 'fetching') {
      const ot = await new Promise((resolve) => {
        eventBus.addEventListener('get-ot', (event) => {
          if (event.detail?.id === imageUrl) {
            resolve(event.detail.ot);
          }
        });
      });

      return ot;
    }
  }

  try {
    requestCaching[imageUrl] = {
      ...requestCaching[imageUrl],
      state: 'fetching',
      id: imageUrl,
    };
    const nameByAI = await getGPT4oOutput(imageUrl);

    requestCaching[imageUrl] = {
      ...requestCaching[imageUrl],
      state: 'fetched',
      id: imageUrl,
      ot: nameByAI,
    };

    return nameByAI;
  } catch (error) {
    console.error('Error:', error);
  }

  return null;
}

async function getGPT4oOutput(url) {
  const response = await fetch(
    'https://throbbing-block-e60e.nazha.workers.dev',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
      }),
    }
  );

  const reader = response.body.getReader();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = new TextDecoder().decode(value);
    const lines = chunk.split('\n').filter((line) => line.trim() !== '');

    let idx = null;
    for (const line of lines) {
      if (line?.trim() === 'event:conversation.message.completed') {
        idx = lines.indexOf(line);
        break;
      }
    }

    try {
      if (idx !== null) {
        const data = JSON.parse(lines?.[idx + 1]?.replace('data:', ''));

        if (data?.type === 'answer') {
          const content =
            typeof data?.content === 'string'
              ? JSON.parse(data?.content)
              : data?.content;

          if (!content?.output?.toLowerCase()?.includes('sorry')) {
            result = content?.output;
            break;
          }
        }
      }
    } catch (err) {
      throw new Error('Failed to parse response from ChatGPT', err.message);
    }
  }

  if (!result) {
    throw new Error('Failed to get response from ChatGPT');
  }

  return result.trim();
}
