import React from 'react';
import DropZone from '../DropZone';
import { caption, container } from './index.module.css';

export default () => (
  <div className={container}>
    <DropZone onChange={(event) => console.log(event.target.files)} />
    <p className={caption}>Upload a .puz file to start a new game</p>
  </div>
);
