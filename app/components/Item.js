import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Text, View, Image, StyleSheet, Dimensions, Platform, TouchableHighlight, AlertIOS, SwitchIOS, Switch, TouchableNativeFeedback} from 'react-native'
import ScreenUtil from '../utils/ScreenUtil'
import UColor from '../utils/Colors'
import Button from './Button'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const itemHeight = ScreenUtil.autoheight(56)

const Font = {
  Ionicons,
  FontAwesome
}

class ItemButton extends Component {
    constructor(props){
      super(props)
    }
    render(){
      return (
        <Button style={{marginTop: this.props.first?10:0}} onPress={this.props.onPress}>
          <View style={styles.button}>
            <Text style={{color: this.props.color || UColor.riseColor}}>{this.props.name}</Text>
          </View>
        </Button>
      )
    }
  }

export default class Item extends Component {

  state = {
    value: false,
    thcolor:UColor.secdColor
  }

  constructor(props){
    super(props)
  }
  static propTypes = {
    icon: PropTypes.string,
    name: PropTypes.string.isRequired,
    subName: PropTypes.string,
    color: PropTypes.string,
    first: PropTypes.bool,
    avatar: PropTypes.number,
    disable: PropTypes.bool,
    iconSize: PropTypes.number,
    font: PropTypes.string,
    onPress: PropTypes.func,
    swt:PropTypes.string,
  }

  _render(){
    let {swt,icon, iconSize, name, subName, color, first, avatar, disable, font} = this.props
    font = font||"Ionicons"
 
    return (
      <View style={[styles.listItem,{marginTop: first?ScreenUtil.autoheight(15):0}]}>
        {icon?(<Icon name={icon} size={iconSize||ScreenUtil.setSpText(20)} style={{width: ScreenUtil.autowidth(22), marginRight:ScreenUtil.autowidth(5), textAlign:"center"}} color={color || UColor.blueDeep} />):null}
        <View style={[styles.listInfo, {borderTopWidth: !first?0.5:0}]}>
          {avatar?(<Image source={avatar} style={{width: ScreenUtil.autowidth(28), height: ScreenUtil.autowidth(28), resizeMode: "cover", overflow:"hidden",marginRight:ScreenUtil.autowidth(10),}}/>):null}
          <View style={{flex: 1}}><Text style={{color:UColor.fontColor, fontSize:ScreenUtil.autowidth(16)}}>{name}</Text></View>
          <View style={styles.listInfoRight}>
            {subName?(<Text style={{color:UColor.arrow, fontSize:ScreenUtil.autowidth(15)}}>{subName}</Text>):null}            
            {disable?null:(<Font.Ionicons style={{marginLeft: ScreenUtil.autowidth(10)}} name="ios-arrow-forward-outline" size={ScreenUtil.autowidth(16)} color={UColor.arrow} />)}
            {!swt?null:( 
            <Switch 
              tintColor={UColor.secdColor}
              onTintColor={UColor.tintColor}
              thumbTintColor={UColor.fontColor}
              value={this.state.value} onValueChange={(value)=>{
              this.setState({value:value})}}
            />)
            }
          </View>
        </View>
      </View>
    )
  }
  render(){
    let { onPress, first, disable } = this.props
    onPress = onPress || (() => {})
    return disable?
      this._render():
      <Button onPress={onPress}>{this._render()}</Button>
  }
}
Item.Button = ItemButton
const styles = StyleSheet.create({
  listItem: {
    height: itemHeight,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button:{
    height: itemHeight,
    backgroundColor: UColor.mainColor,
    justifyContent: "center",
    alignItems: "center"
  },
  listInfo: {
    height: itemHeight,
    flex: 1,
    paddingHorizontal: ScreenUtil.autowidth(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: UColor.secdColor
  },
  listInfoRight: {
    flexDirection: "row",
    alignItems: "center"
  }
})
