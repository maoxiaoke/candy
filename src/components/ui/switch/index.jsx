import React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import './styles.css';

const Switch = ({ label, defaultChecked, onCheckedChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <label className="Label" htmlFor="airplane-mode" style={{ paddingRight: 15 }}>
      {label}
    </label>
    <div style={{
      flexShrink: 0,
    }}>
      <RadixSwitch.Root className="SwitchRoot" id="airplane-mode" defaultChecked={defaultChecked} onCheckedChange={onCheckedChange}>
        <RadixSwitch.Thumb className="SwitchThumb" />
      </RadixSwitch.Root>
    </div>

  </div>
);

export { Switch };