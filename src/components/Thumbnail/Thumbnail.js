import React,{Component,Fragment} from 'react'
import * as PIXI from "pixi.js";
import { Sprite, withApp, Container, Text } from "react-pixi-fiber";
import {TweenLite,  Power2} from "gsap/TweenMax";
import ThumbnailBackgound from "./ThumbnailBackgound"
const iconPath = process.env.PUBLIC_URL + '/assets/icons/';
// Scale mode for all textures, will retain pixelation
//PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const CENTER = new PIXI.Point(0.5, 0.5);
class Thumbnail extends Component {
  state = { 
    scale: new PIXI.Point(1, 1),
    currentSelect : false,
  };

  shouldComponentUpdate(nextProps, nextState){
    
    // console.log('[masonms] thumbnail shouldComponentUpdate: ' 
    // + this.props.selected + ' / ' 
    // + nextProps.selected + ' / ' 
    // + this.props.idx + ' / ' 
    // + nextProps.idx + ' / '
    // + this.props.thumbnailVisible + ' / '
    // + nextProps.thumbnailVisible);

      if( nextProps.thumbnailVisible ){
      //   console.log('[masonms] thumbnail shouldComponentUpdate: ' 
      // + this.props.selected + ' / ' 
      // + nextProps.selected + ' / ' 
      // + this.props.idx + ' / ' 
      // + nextProps.idx + ' / '
      // + this.props.thumbnailVisible + ' / '
      // + nextProps.thumbnailVisible + ' / '
      // + this.props.containerIndex + ' / '
      // + nextProps.containerIndex + ' || '
      // + 1);
        return true;
      }
      else{
        if(this.props.thumbnailVisible){
          // console.log('[masonms] thumbnail shouldComponentUpdate: ' 
          // + this.props.selected + ' / ' 
          // + nextProps.selected + ' / ' 
          // + this.props.idx + ' / ' 
          // + nextProps.idx + ' / '
          // + this.props.thumbnailVisible + ' / '
          // + nextProps.thumbnailVisible + ' / '
          // + this.props.containerIndex + ' / '
          // + nextProps.containerIndex + ' || '
          // + 2);
          return true
        }
        // if(nextProps.selected){
        //   console.log('[masonms] thumbnail shouldComponentUpdate: ' 
        //   + this.props.selected + ' / ' 
        //   + nextProps.selected + ' / ' 
        //   + this.props.idx + ' / ' 
        //   + nextProps.idx + ' / '
        //   + this.props.thumbnailVisible + ' / '
        //   + nextProps.thumbnailVisible + ' / '
        //   + this.props.containerIndex + ' / '
        //   + nextProps.containerIndex + ' || '
        //   + 3);
        //   return true;
        // }
        // if(this.props.selected){
        //   console.log('[masonms] thumbnail shouldComponentUpdate: ' 
        //   + this.props.selected + ' / ' 
        //   + nextProps.selected + ' / ' 
        //   + this.props.idx + ' / ' 
        //   + nextProps.idx + ' / '
        //   + this.props.thumbnailVisible + ' / '
        //   + nextProps.thumbnailVisible + ' / '
        //   + this.props.containerIndex + ' / '
        //   + nextProps.containerIndex + ' || '
        //   + 4);
        //   return true
        // }
        // console.log('[masonms] thumbnail shouldComponentUpdate: ' 
        // + this.props.selected + ' / ' 
        // + nextProps.selected + ' / ' 
        // + this.props.idx + ' / ' 
        // + nextProps.idx + ' / '
        // + this.props.thumbnailVisible + ' / '
        // + nextProps.thumbnailVisible + ' / '
        // + this.props.containerIndex + ' / '
        // + nextProps.containerIndex + ' || '
        // + 5);
        return false;
      }
  }


  
  componentDidMount() {
    // Note that `app` prop is coming through `withApp` HoC
    //this.props.app.ticker.add(this.animate);
    // console.log('[masonms] thumbnail componentDidMount');
  }
  // shouldComponentUpdate(){
  //   //현재 선택되지않았고 
  //   if(!this.state.currentSelect && this.props.selected){
  //     console.log("shouldComponentUpdate ", this.props.selected)
  //     this.ifSelected();
  //     return true;
  //   }
  //   return false;
  // }
  ifSelected = () => {
    this.setState({
      currentSelect: true,
      scale: this.state.scale * 1.25
    })
  }

  componentDidUpdate(){
    
    // console.log('[masonms] thumbnail componentDidUpdate');
    const { selected, containerIndex } =this.props; 
    if( selected ){
      this.grow();
    }else{
      this.shrink()
    }
  }

  componentWillUnmount() {

  }


  // handleClick = () => {
  //   this.setState(state => ({ ...state, scale: state.scale * 1.25, currentSelect : true }));
  // };

  shrink = () => {
    const { x, y } = this.props;
    TweenLite.to(this.spr.scale, .2, {x: 1.0, y: 1.0, ease: Power2.easeInOut})
    TweenLite.to(this.title, .2, {alpha: 0, ease: Power2.easeInOut})
    //TweenLite.to(this.shadowdSprite, .2, {x: {x}, y: {y}, ease: Power2.easeInOut})
  };

  grow = () => {
    const { x, y } = this.props;
    let posY = y + 50
    // this.spr.filters = [
    //   new GlowFilter(15, 2, 1, 0xFF0000, 0.5)
    // ];
    //console.log(this.thumbnailContentContainer.visible = false)
    TweenLite.to(this.spr.scale, .2, {x: 1.1, y: 1.1, ease: Power2.easeInOut})
    TweenLite.to(this.title, .2, {alpha: 1, ease: Power2.easeInOut})
    //TweenLite.to(this.shadowdSprite, .2, {x: {x}, y: {posY}, ease: Power2.easeInOut})
  };
  render() {
    const { src, x, y, selected, title,thumbnailVisible, idx} = this.props;

    //console.log('thumbCon ' ,thumbCon)
    // const img2 = <img src={require(src)} alt=''/>
    const img2 = <img src={require(`${src}`)} alt=''/>
    const shadow = <img src={require(`${'./shadow-selected.png'}`)} alt=''/>
    //console.log(img2)
    // console.log('[masonms] thumnbnail render: ' + thumbnailVisible + ' / ' + idx);
    return (
        <Container ref = { ref => { this.thumbnailContentContainer = ref }}
                   visible ={thumbnailVisible} 
                   >
          <Sprite
            {...this.props}
            anchor={new PIXI.Point(0.5, 0.5)}
            x={x} 
            y={y+50}
            height={350}
            width={250}
            texture={PIXI.Texture.fromImage(shadow.props.src)}
            ref ={ref =>{ this.shadowdSprite = ref }}
          />
          <Sprite 
              // Shows hand cursor
              // buttonMode
              // // Opt-in to interactivity
              interactive
              pointerdown={this.grow}
              pointerup={this.shrink}
              ref={ref => {
                  this.spr = ref;
                }}
              scale={this.state.scale}

              {...this.props}
              anchor={CENTER}
              x={x} 
              y={y}
              texture={PIXI.Texture.fromImage(img2.props.src)}
          />
          {selected ? 
          <ThumbnailBackgound
                anchor={new PIXI.Point(0.5, 0.5)}
                x={x - 156 }
                y={y - 230}
                width={260 * 1.2}
                height={350 * 1.3}
                lineFill={0xff700b}
                isOuter={true}
          />
          : <Fragment></Fragment>
          }
          <Text text={title} 
                style={{ fontSize: 30, fontWeight: 'bold'}}  
                anchor={CENTER}
                x= { x }  
                y= { y + 250 } 
                alpha = {0}
                ref={ref => {
                  this.title = ref;
               }} />

        </Container>
    );
  }
}
export default withApp(Thumbnail)
