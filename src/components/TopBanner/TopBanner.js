import React,{Component, Fragment} from 'react'
import * as PIXI from "pixi.js";
import { Sprite, withApp, Container, Graphics } from "react-pixi-fiber";
import Bullet from '../Bullet'
import FM from 'Supporters/navi.js';
import { TweenLite, Linear, Power2 } from "gsap/TweenMax";

import GlobalMenuBackground from '../GlobalMenu/GlobalMenuBackgound.js';

import _ from 'lodash';

const DIR = {
  LEFT: -1,
  RIGHT: 1
}

class TopBanner extends Component {
  constructor(props){
    super(props);
    this.intervalId = 0;
    this.INTERVAL_TIME = 3000;    
  }

  tHandle = null;
  state = {
    rotation: 0,
    banner : '',
    bannerIndex : 0,
  };

  containerScale = new PIXI.Point(1, 1);
  
  componentDidMount(){ 
    this.tHandle = _.throttle(this.onKeyDown, 100);
    window.addEventListener('keydown', this.tHandle);

    const { setFm, focusList, src } = this.props;
    // Note that `app` prop is coming through `withApp` HoC
    // console.log('componentDidMount focusList Selected: ' + this.props.focusList.selected);
    this.props.app.ticker.add(this.animate);
      this.intervalId = setInterval(() =>{
        this.renderBlock();
      },this.INTERVAL_TIME)
      setFm('banner', new FM({
        id : 'banner',
        containerSelector: '.slideCon',
        moveSelector : '.slideCon .slideWrapper .slide',
        focusSelector : '.csFocus',
        row : 1,
        col : src.length,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : src.length -1,
        bRowRolling: true,
        onFocusKeyDown: this.onKeyDown
    }));
  }

  slide(direction) {
    const { bannerIndex } = this.state;
    const { src } = this.props;

    // const moveFromRightToLeft = { x:-100, opacity:0, ease:Power2.easeInOut, 
    //   onComplete: () =>{
    //     TweenLite.fromTo(this.bnr, .3, { x:100 }, {x:0} )
    //   }
    // };
    // const moveFromLeftToRight = { x:100, opacity:0, ease:Power2.easeInOut,
    //   onComplete: () =>{
    //     TweenLite.fromTo(this.bnr, .3, { x:-100 }, {x:0} )
    //   }
    // };
    switch (direction){
      case DIR.RIGHT:
        this.setState({
          bannerIndex: bannerIndex + 1  === src.length ? 0 : bannerIndex + 1
        });
        
        // fade in
        // TweenLite.to(this.bnr, .1, { x:50, opacity:0, ease:Power2.easeInOut,
        //   onComplete: () =>{
        //     this.setState({
        //       bannerIndex: bannerIndex + 1  === src.length ? 0 : bannerIndex + 1,
        //       // scale: new PIXI.Point(1.1, 1.1),
        //     });
        //     TweenLite.fromTo(this.bnr, 0, { x:-50 }, {x:0} );
        //   }
        // });
 
        break;
      case DIR.LEFT:
        this.setState({
          bannerIndex: bannerIndex -1  === -1 ? src.length - 1 : bannerIndex -1
        });

        // TweenLite.to(this.bnr, .1, { x:-50, opacity:0, ease:Power2.easeInOut, 
        //   onComplete: () =>{
        //     this.setState({
        //       bannerIndex: bannerIndex -1  === -1 ? src.length - 1 : bannerIndex -1,
        //       // scale: new PIXI.Point(1.1, 1.1),
        //     });
        //     TweenLite.fromTo(this.bnr, .1, { x:50 }, {x:0} )
        //   }
        // });

        // TweenLite.fromTo(this.bnr, 1, from, to);
        break;
      default:
        break;
    }
    
  }
  
  onKeyDown = (evt, a) => {
        // console.log('%c evt, a', 'color: green', evt, a);
        const { focusList } = this.props;
        if( focusList.selected ){
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
        else{
          return;
        }
    }
  componentWillUpdate(){
    const { bannerFocus, focusList, src } = this.props;
    const { bannerIndex } = this.state;

    if( focusList.selected ){
      clearInterval(this.intervalId);
      
    }
    else {
      // console.log('reset interval');
      clearInterval(this.intervalId);
      // TweenLite.to(this.bnr.scale, .2, {x: 1, y: 1, ease: Power2.easeInOut});
      this.intervalId = setInterval(() =>{
        this.renderBlock();
      }, this.INTERVAL_TIME)
    }
    // console.log(bannerFocus);
  }

  shouldComponentUpdate(nextProps, nextState){

    // console.log(this.props.focusList.selected + ' / ' + this.props.focusList.index + ' / ' + this.state.bannerIndex);
    // console.log(nextProps.focusList.selected + ' / ' + nextProps.focusList.index + ' / ' + nextState.bannerIndex);
    // console.log(this.props.focusList.index + ' / ' + nextProps.focusList.index);
    // console.log(this.state.bannerIndex + ' / ' + nextState.bannerIndex);
    // console.log('-----------------------------------------');
    // 배너 Focus OFF 시 Interval 등록

    if( !this.props.focusList.selected ){
      // console.log('focus off');
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() =>{
        this.renderBlock();
      }, this.INTERVAL_TIME)

      return true;
    }

    // 배너 Focus ON and FocusList.index의 변경(좌우) 
    else{
      if( this.state.bannerIndex !== nextState.bannerIndex ){
        return false;
      }
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
    if( this.intervalId ){
      clearInterval(this.intervalId);
    }

    window.removeEventListener('keydown', this.tHandle);
  }

  handleClick = () => {
    // console.log(this.bnr);
    // console.log(TweenLite.fromTo);
    // clearInterval(this.intervalId);
    console.log('handleClick')
    const moveFromRightToLeft = { x:-100, opacity:0, ease:Power2.easeInOut };
    const moveFromLeftToRight = { x:100, opacity:0, ease:Power2.easeInOut };
    
    TweenLite.to(this.bnr, 1, moveFromRightToLeft);
    TweenLite.to(this.bnr, 1, moveFromLeftToRight);
  };

  render() {
    const { bannerIndex } = this.state;
    const { src,x,y, focusList } = this.props;
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
          <Container 
            scale={focusList.selected ? new PIXI.Point(1.1, 1.1) : new PIXI.Point(1, 1)}
            ref={ref => {
              this.cnr = ref;
            }}
          >
            <Sprite
                interactive
                ref={ref => {
                  this.bnr = ref;
                }}
                {...this.props}
                x={0} 
                y={0}
                height={350}
                width={1980}
                texture={PIXI.Texture.fromImage(logo)}
            />
            {indicater}
            <Container
              alpha={focusList.selected ? 1 : 0}>
              <GlobalMenuBackground
                x={0}
                y={50}
                width={1980}
                height={300}
                lineFill={0xff700b}
                isOuter={true}
              />
            </Container>
            </Container>
        </Fragment>
    );
  }
}
export default withApp(TopBanner)