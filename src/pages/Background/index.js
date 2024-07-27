chrome.contextMenus.create({
  id: 'candy-download-image',
  title: 'Download image with Candy',
  contexts: ['image'],
});

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'candy-download-image') {
    renameAndDownloadImage(info.srcUrl);
  }
});

async function renameAndDownloadImage(imageUrl) {
  let newName = '';
  try {
    newName = await getGPT4oOutput(imageUrl);
  } catch (error) {
    console.error('Error:', error);
  }

  const extension = imageUrl.split('.').pop();

  let fileName = newName;

  if (imageExtensions.includes(extension?.toLowerCase())) {
    fileName = `${newName}.${extension}`;
  }

  chrome.downloads.download({
    url: imageUrl,
    filename: newName ? fileName : undefined,
    saveAs: true,
  });
}

async function getGPT4oOutput(url) {
  const apiKey =
    'pat_ZEytqDPZrqeCBNfVVRoWaMJ0gMHakMhSmXDzuOQFaa3SQXV19BWDxxtysd2gGGkL';
  const response = await fetch('https://api.coze.com/v3/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: '7394291289405227025',
      user_id: '123456',
      additional_messages: [
        { role: 'user', content: url, content_type: 'text' },
      ],
      stream: true,
      auto_save_history: false,
    }),
  });

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
