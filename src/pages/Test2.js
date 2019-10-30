import React, { Component } from "react";
import { Stage, Sprite, Container, withApp } from "react-pixi-fiber";
import * as PIXI from "pixi.js";

import axios from 'axios';

import _ from 'lodash'

const OPTIONS = {
  backgroundColor: 0xffffff,
};

class RenderTest extends Component {
        constructor(props) {
                super(props);
        }
        componentWillMount(){
                // console.log(this.props);
                // console.log(this.props.idx + ' / componentWillMount');
                // console.log('componentWillMount');
        }

        componentDidMount() {
                // console.log(this.props.idx + ' / componentDidMount');
                // this.props.app.loader.add('image'+this.props.idx, PIXI.Sprite.fromImage(this.props.urlSource.url.props.src));
                // this.props.app.loader.load((loader, resources) => {
                //         console.log('loading');
                //         console.log(loader);
                //         console.log(resources);
                // });
                // console.log(this.props.urlSource.link);
        }

        componentWillUpdate(){

        }

        componentDidUpdate(){

        }

        shouldComponentUpdate(nextProps, nextState) {
                // console.log(this.props.idx);
                return true;
        }

        render() {
                const { urlSource } = this.props;
                let img;
                if( this.props.onError ){
                        console.log(urlSource[0].url);
                        img = <img src={require(`${urlSource[0].url}`)} alt=''/>
                }
                
                // console.log(this.state.url1.props.src);
                // console.log(this.state.url2.props.src);
                // console.log(this.state.defaultImage.props.src);
                // console.log(this.props.urlSource === null)
                // console.log(this.props.urlSource.url.props.src);
                // console.log(this.state.defaultImg.url.props.src);
                return (
                        <Container>
                                <Sprite
                                        x={13*this.props.idx}
                                        y={10*this.props.idx}
                                        width={150}
                                        height={150}
                                        // texture={PIXI.Texture.fromImage(this.props.urlSource.url.props.src)}
                                        texture={this.props.onError ?
                                                PIXI.Texture.fromImage(img.props.src) :
                                                PIXI.Texture.fromImage(this.props.urlSource.link)}
                                />
                        </Container>
                )
        }
}

const RenderTestWithApp = withApp(RenderTest);

class Test2 extends Component {
        state = {
                defaultImage : [
                        {
                          type: 'link',
                          src: [
                            {url: './TestImage/thumbnail_default.jpg'},
                          ]
                        },
                ],
                imageDatas: [],
        }
        constructor(props){
                super(props);
        }

        getData = async () => {
                try{
                        await axios.get('http://localhost:3001/get-json-images').then( async (response) => {
                        // console.log(response.data.data);
                                this.setState({
                                        imageDatas: response.data.data
                                });
                        });
                }
                catch(e){
                        console.error(e);
                }
                
        }

        componentWillMount() {
                this.getData();
        }

        render() {
                // console.log(this.state.imageDatas.length);
                const { defaultDatas } = this.state;
                return  ( 
                        <Stage width={1980} height={1080} options={OPTIONS} >
                                <Container ref ={ref => {this.wrapper = ref}}>
                                        {this.state.imageDatas.length === 0 ? 
                                        <RenderTestWithApp urlSource={this.state.defaultImage[0].src} onError={true} idx={0} key={0}/> : 
                                        this.state.imageDatas.map((url, idx) => {
                                                // console.log(url);
                                                        return(
                                                                <RenderTestWithApp urlSource={url} key={idx} idx={idx} onError={false}/>
                                                        )
                                                })
                                        }
                                </Container>
                        </Stage>
                )       
        }
}

export default withApp(Test2);
