/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

const listColor = [
  '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728',
  '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2',
  '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
];

class ColorLabel {
  static getColor(label) {
    let color = this.__map[label];
    if (!color) {
      this.__map[label] = color = (this.__idx < listColor.length) ?
        listColor[this.__idx++] :
        listColor[0];
    }
    return color;
  }

  static getColorMap() {
    return this.__map;
  }
}
ColorLabel.__map = {};
ColorLabel.__idx = 0;

export default ColorLabel;
