import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

// 在content script中
document.addEventListener('contextmenu', function (e) {
  console.log('fsafsf', e.target);
  // 检查右键点击的元素是否为图片
  if (e.target.tagName.toLowerCase() === 'img') {
    // 获取图片的src属性（图片地址）
    const imageUrl = e.target.src;

    console.log('右键点击了一张图片');
    console.log('图片地址:', imageUrl);

    // 如果你想阻止默认的右键菜单，取消下面这行的注释
    // e.preventDefault();

    // 如果你想将这个信息发送到background script，可以使用下面的代码
    chrome.runtime.sendMessage({
      type: 'imageRightClick',
      url: imageUrl,
    });
  }
});
