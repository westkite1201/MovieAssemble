import React, { Component } from "react";
import { Stage, Sprite, Container, Text, withApp } from "react-pixi-fiber";
import * as PIXI from "pixi.js";

import _ from 'lodash'

const OPTIONS = {
  backgroundColor: 0xffffff,
};

class RenderTest extends Component {
        constructor(props){
                super(props);
                this.state = {
                        url1: '',
                        url2: '',
                }
                const test1 = "./TestImage/Complete.jpg";
                const test2 = "./TestImage/Preview.jpg";
                this.setState({
                        url1 : <img src={require(`${test1}`)} alt=''/>,
                        url2 : <img src={require(`${test2}`)} alt=''/>,
                });

        }

        componentWillMount() {
                this.props.app.loader.add('Complete', './TestImage/Complete.jpg')
                                     .add('Preview', './TestImage/Preview.jpg')
                                     .once('complete', (loader, resources) => {
                                        
                                        // const sprite1 = new PIXI.Sprite.fromImage(this.state.url1);
                                        // const sprite2 = new PIXI.Sprite.fromImage(this.state.url2);
                                  }).load();
        }

        render() {
                return (
                        <Sprite
                                {...this.props}
                                texture={this.props.texture}
                        />
                )
        }
}

const RenderTestWithApp = withApp(RenderTest);

class Test extends Component {
        constructor(props){
                super(props);
                this.state = {
                        url1: '',
                        url2: '',
                }
                const test1 = "./TestImage/Complete.jpg";
                const test2 = "./TestImage/Preview.jpg";
                this.setState({
                        url1 : <img src={require(`${test1}`)} alt=''/>,
                        url2 : <img src={require(`${test2}`)} alt=''/>,
                });

        }

        componentWillMount(){

        }
        render() {
                return  ( 
                        <Stage width={1980} height={1080} options={OPTIONS} >
                                <Container ref ={ref => {this.wrapper = ref}}>
                                        <RenderTestWithApp texture={this.state.url1}/>
                                </Container>
                        </Stage>
                )       
        }
}

export default withApp(Test);
