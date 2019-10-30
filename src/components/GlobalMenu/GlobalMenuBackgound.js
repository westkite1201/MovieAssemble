import * as PIXI from "pixi.js";
import { CustomPIXIComponent } from "react-pixi-fiber";

export const GlobalMenuBackground = {
    customDisplayObject: props => new PIXI.Graphics(),
    customApplyProps: function(instance, oldProps, newProps) {
    const { fill, x, y, width, height, isOuter, lineFill } = newProps;
    if( isOuter ){
      instance.clear();
      instance.lineStyle(5, lineFill, 1, 1);
      instance.beginFill(0xffffff, 0);
      instance.drawRect(x-10, y, width, height);
      instance.endFill();
    }
    else{
      instance.clear();
      instance.beginFill(fill);
      instance.drawRect(x, y, width, height);
      instance.endFill();
    }
    }
  };

export default CustomPIXIComponent(GlobalMenuBackground, 'GlobalMenuBackground');