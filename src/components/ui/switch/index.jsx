import React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import './styles.css';

const Switch = ({ label, defaultChecked, onCheckedChange, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 500 }}>
    <label className="Label" htmlFor="airplane-mode" style={{ paddingRight: 15 }}>
      {label}
    </label>
    <div style={{
      flexShrink: 0,
    }}>
      <RadixSwitch.Root className="SwitchRoot" id="airplane-mode" defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} checked={value}>
        <RadixSwitch.Thumb className="SwitchThumb" />
      </RadixSwitch.Root>
    </div>

  </div>
);

export { Switch };