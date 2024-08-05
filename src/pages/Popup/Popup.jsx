import React, { useEffect } from 'react';

import { Switch } from '../../components/ui/switch'
import './Popup.css';
import { getSettings, defaultSettings } from '../../utils/index';

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
        
        <div className="divider"></div>
        <Switch label="Get response when context menu shown" onCheckedChange={onContextMenuChange} value={settings?.getResponseWhenContextMenuShown} />
      </form>
    </div>
  );
};

export default Popup;
