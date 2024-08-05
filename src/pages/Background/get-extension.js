const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

const brandExtentionMapping = {
  x: {
    match: /pbs.twimg.com/,
    brand: 'x',
    handler: (url) => {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const format = params.get('format');

      if (imageExtensions.includes(format)) {
        return format;
      }

      return false;
    },
  },
};

export const getImageExtension = async (url) => {
  const brands = Object.keys(brandExtentionMapping);

  for (let i = 0; i < brands.length; i++) {
    const { match, handler } = brandExtentionMapping[brands[i]];
    if (match.test(url)) {
      return handler(url);
    }
  }

  const _url = new URL(url);

  const extension = _url.pathname.split('.').pop();

  return imageExtensions.includes(extension) ? extension : false;
};
