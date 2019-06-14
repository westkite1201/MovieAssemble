import React,{Component, Fragment} from 'react'
import * as PIXI from "pixi.js";
import { Sprite, withApp } from "react-pixi-fiber";
import Bullet from '../Bullet'

import FM from 'Supporters/navi.js';

let prevImage;
let nowImage;
let nextImage;

const DIR = {
  LEFT: 0,
  RIGHT: 1
};

class TopBanner extends Component {
  constructor(props){
    super(props);
    this.intervalId = 0;
    this.INTERVAL_TIME = 3000;
  }

  state = {
    rotation: 0,
    banner : '',
    bannerIndex : 0,
    sliding: false,
  };

  componentDidMount(){ 
    const { setFm, src } = this.props;
    // // Note that `app` prop is coming through `withApp` HoC
    // // console.log('componentDidMount focusList Selected: ' + this.props.focusList.selected);
    // setFm('banner', new FM({
    //   key: 'banner',
    //   id : 'banner',
    //   containerSelector: '.slideCon',
    //   moveSelector : '.slideCon .slideWrapper .slide',
    //   focusSelector : '.csFocus',
    //   row : 1,
    //   col : src.length,
    //   focusIdx : 0,
    //   startIdx : 0,
    //   lastIdx : src.length -1,
    //   bRowRolling: true,
    //   onFocusKeyDown: this.onKeyDown
    // }));
    
    this.props.app.ticker.add(this.animate);
      this.intervalId = setInterval(() =>{
        this.renderBlock();
      },this.INTERVAL_TIME)
  }

  onKeyDown = (evt, a) => {
    console.log('%c evt, a', 'color: green', evt, a);
    switch(evt.keyCode) {
    case 39:
        this.slide(DIR.RIGHT);
        break;
    case 37:
        this.slide(DIR.LEFT);
        break;
    default:
        break;
    }
}

  slide = (dir) => {
    console.log(dir);
  }

  componentWillUpdate(){
    const { bannerFocus, focusList, src } = this.props;
    // const { bannerIndex, sliding } = this.state;
    // console.log('componentWillUpdate / ' + bannerFocus);
    // console.log('componentWillUpdate focusList Selected: ' + this.props.focusList.selected);
    console.log(this.props);
    if( focusList.selected ){
      // console.log('clear interval');
      // console.log(focusList.index);
      console.log(focusList.index);
      // console.log(bannerIndex);
      clearInterval(this.intervalId);
      // this.setState({
      //   sliding: !sliding,
      //   bannerIndex: bannerIndex + 1  === src.length ? 0 : bannerIndex + 1
      // });
      this.renderBlock();
    }
    else {
      // console.log('reset interval');
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() =>{
        this.renderBlock();
      }, this.INTERVAL_TIME)
    }
    // console.log(bannerFocus);
  }

  shouldComponentUpdate(nextProps, nextState){

    console.log(this.props.focusList.index + ' / ' + this.state.bannerIndex);
    console.log(nextProps.focusList.index + ' / ' + nextState.bannerIndex);
    // console.log(nextProps.focusList.index % (this.props.src.length));
    console.log('--------------------------');
    const { bannerIndex } = nextState;

    // console.log(bannerIndex + ' / ' + nextProps.src[bannerIndex].url);

    // 배너 Focus OFF 시 Interval 등록
    if( !this.props.focusList.selected ){
      // console.log('focus off');
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() =>{
        this.renderBlock();
      }, this.INTERVAL_TIME)

      return true;
    }
    // else if( this.props.focusList.selected ){
    //   clearInterval(this.intervalId);
    //   return false;
    // }

    // 배너 Focus ON and FocusList.index의 변경(좌우) 
    else if( this.props.focusList.selected && this.props.focusList.bannerIndex !== nextProps.focusList.bannerIndex ){
      // console.log('focus on');
      if( this.props.focusList.index < nextProps.focusList.index ){
        // console.log(this.props.focusList.index + ' / ' + nextProps.focusList.index)
        this.setState({
          banner : '',
          bannerIndex: this.state.bannerIndex + 1  === this.props.src.length ? 0 : this.state.bannerIndex + 1
        })
        return false;
      }
      else{
        this.setState({
          banner : '',
          bannerIndex: this.state.bannerIndex -1  ===  0 ? this.props.src.length : this.state.bannerIndex - 1
        })
        return false;
      }
    }

    if( this.state.bannerIndex !== nextState.bannerIndex && this.props.focusList.selected ){
      if( this.props.focusList.index < nextProps.focusList.index ){
        this.setState({
          banner : '',
          bannerIndex: this.state.bannerIndex + 1  === this.props.src.length ? 0 : this.state.bannerIndex + 1 
        })
      }
      else{
        this.setState({
          banner : '',
          bannerIndex: this.state.bannerIndex -1  ===  0 ? this.props.src.length : this.state.bannerIndex - 1 
        })
      }
      return false;
    }
    else{
      return true;
    }
    // console.log(this.props.bannerFocus && nextProps.bannerFocus)
    // return true;
  }

  renderBlock = () => {
    const { src } = this.props;
    const { bannerIndex } = this.state;
    this.setState({
      banner : '',
      bannerIndex: bannerIndex + 1  === src.length ? 0 : bannerIndex + 1 
    })
  }

  // renderBlock = (keyInput) => {
  //   const { src, bannerFocus } = this.props;

    
  // }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.animate);
    clearInterval(this.intervalId);
  }

  render() {
    const { bannerIndex } = this.state;
    const { src,x,y, bannerFocus } = this.props;
    // console.log(bannerFocus);
    //console.log('TopBannerNew Render ', bannerIndex )
    // console.log(src);
    // console.log(src);

    // console.log(this.state);

    const logo = require(`${src[bannerIndex].url}`)
    let indicater = src.map((item, key) =>{
      return (<Bullet   key ={key} 
                        fill = {key === bannerIndex ? 0x000000 :  0xffffff}
                        x={10 * key + 50}
                        y={300}
                        r={3}>
              </Bullet>
        )
    });

   // console.log(logo)
    return (
        <Fragment>
          <Sprite
            
              interactive

              {...this.props}
              x={0} 
              y={0}
              height={350}
              width={1980}
              texture={PIXI.Texture.fromImage(logo)}
          />
          {indicater}
        </Fragment>
    );
  }
}
export default withApp(TopBanner)
