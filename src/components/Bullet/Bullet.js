import React, { Component } from 'react'
import * as PIXI from "pixi.js";
import { Sprite, withApp, Graphics, CustomPIXIComponent } from "react-pixi-fiber";
//const  drawRect = new PIXI.point(0, 250, 100, 100)
const TYPE = "circle";

export const behavior = {
  customDisplayObject: props => new PIXI.Graphics(),
  customApplyProps: function(instance, oldProps, newProps) {
    const { fill, x, y, r,  } = newProps;
    instance.clear();
    instance.beginFill(fill);
    instance.drawCircle(x, y, r);
    instance.alpha = 1
    instance.endFill();
  }
};
export default CustomPIXIComponent(behavior, TYPE);