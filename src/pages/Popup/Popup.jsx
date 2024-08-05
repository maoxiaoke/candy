import React from 'react';

import { Switch } from '../../components/ui/switch'
import './Popup.css';
import { getSettings } from '../../utils/index';

const Popup = () => {
  const onRenameChange = async (checked) => {
    const settings = await getSettings();

    chrome.storage.sync.set({
      ...settings,
      getResponseWhenContextMenuShown: checked,
    }, () => {
      console.log('Settings saved');
    });
  }

  const onContextMenuChange = async (checked) => {
    const settings = await getSettings();

    chrome.storage.sync.set({
      ...settings,
      renameAfterDownload: checked,
    }, () => {
      console.log('Settings saved');
    });
  }

  return (
    <div className="popup">
      <form>
        <Switch label="Rename image after loaded" onCheckedChange={onRenameChange} />
        
        <div className="divider"></div>
        <Switch label="Get response when context menu shown" onCheckedChange={onContextMenuChange} />
      </form>
    </div>
  );
};

export default Popup;
