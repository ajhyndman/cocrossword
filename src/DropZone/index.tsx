import React from 'react';
import { input, label } from './index.module.css';

type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default ({ onChange }: Props) => (
  <label className={label}>
    <span className="material-icons" style={{ fontSize: 56 }}>
      upload
    </span>
    <input
      type="file"
      accept=".puz"
      className={input}
      onChange={onChange}
    ></input>
  </label>
);
