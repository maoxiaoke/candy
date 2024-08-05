// 在content script中
document.addEventListener('contextmenu', function (e) {
  // 检查右键点击的元素是否为图片
  if (e.target.tagName.toLowerCase() === 'img') {
    // 获取图片的src属性（图片地址）
    const imageUrl = e.target.src;

    // 如果你想阻止默认的右键菜单，取消下面这行的注释
    // e.preventDefault();

    // 如果你想将这个信息发送到background script，可以使用下面的代码
    chrome.runtime.sendMessage({
      type: 'imageRightClick',
      url: imageUrl,
    });
  }
});
