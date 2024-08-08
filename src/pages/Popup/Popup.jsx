import React, { useEffect } from 'react';

import { Switch } from '../../components/ui/switch'
import './Popup.css';
import { getSettings, defaultSettings } from '../../utils/index';

const openUrl = (url) => {
  chrome.tabs.create({ url });
}

const Popup = () => {
  const [settings, setSettings] = React.useState(defaultSettings);

  useEffect(() => {
    getSettings().then((settings) => {
      setSettings(settings);
    });
  }, [])

  const onRenameChange = async (checked) => {

    chrome.storage.sync.set({
      ...settings,
      renameAfterDownload: checked,
    }, () => {

      setSettings({
        ...settings,
        renameAfterDownload: checked
      })
    });
  }

  const onContextMenuChange = async (checked) => {
    chrome.storage.sync.set({
      ...settings,
      getResponseWhenContextMenuShown: checked,
    }, () => {
      setSettings({
        ...settings,
        getResponseWhenContextMenuShown: checked,
      });
    });
  }

  return (
    <div className="popup">
      <form>

        <Switch label="Rename image after loaded" onCheckedChange={onRenameChange} value={settings?.renameAfterDownload} />

        <label style={{
          fontSize: '12px',
          display: 'inline-block',
          marginTop: '2px',
          lineHeight: '14px',
          color: '#666'
        }}>
          When this option is turned off, the download dialog will only appear after GPT has finished returning the response, which sometimes may not be immediate.
        </label>
        
        {/* <div className="divider"></div> */}
        {/* <Switch label="Get response when context menu shown" onCheckedChange={onContextMenuChange} value={settings?.getResponseWhenContextMenuShown} /> */}

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <a href="https://buymeacoffee.com/nazha" onClick={(evt) => {
            evt.preventDefault();
            openUrl('https://buymeacoffee.com/nazha')
          }}>Support</a>
          <a href="https://x.com/xiaokedada" onClick={(evt) => {
            evt.preventDefault();
            openUrl('https://x.com/xiaokedada')
          }}>Author on X</a>
        </div>
      </form>
    </div>
  );
};

export default Popup;
