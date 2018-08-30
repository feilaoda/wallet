import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { StyleSheet, Dimensions, View, Text, Image, TouchableOpacity, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import ScreenUtil from '../utils/ScreenUtil'
import UColor from '../utils/Colors'
import BaseComponent from "../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
 
class Header extends BaseComponent {
   
    constructor(props) {
        super(props);
    }
    
    //组件加载完成
    componentDidMount() {
        //alert(JSON.stringify(UColor.theme))
    }

    static propTypes = {
        onPressLeft: PropTypes.bool,
        title: PropTypes.string.isRequired,
        onPressRight: PropTypes.func,
        avatar: PropTypes.number,
        subName: PropTypes.string,
        backgroundColor: PropTypes.string,
    }

    render(){
        let {backgroundColor, onPressLeft, title, onPressRight, avatar, subName,} = this.props
        return (
        <View style={[styles.header,{backgroundColor: backgroundColor ? backgroundColor : UColor.theme ? UColor.blueDeep : UColor.mainColor}]}>
          <TouchableOpacity style={styles.Leftout} onPress={() => {onPressLeft ? this.props.navigation.goBack() : undefined}}>
            {onPressLeft &&<Ionicons style={{color:UColor.btnColor}} name="ios-arrow-back" size={ScreenUtil.setSpText(30)}/>}
          </TouchableOpacity>
          <View style={styles.center} >
              <Text style={[styles.titletext,{color:UColor.btnColor}]} numberOfLines={1} ellipsizeMode='middle'>{title}</Text>
          </View>   
          <TouchableOpacity style={styles.Rightout} onPress={onPressRight}>
              {avatar?<Image source={avatar} style={styles.Rightimg} resizeMode={'contain'} />:null}
              {subName?<Text style={[styles.Righttext,{color: UColor.btnColor}]}>{subName}</Text>:null}
          </TouchableOpacity>
        </View>  
        )
    }
}
 
const styles = StyleSheet.create({
    header:{
        flexDirection:"row",
        alignItems:"center",
        paddingTop: ScreenUtil.autoheight(20),
        height: ScreenUtil.autoheight(65),
    },
    Leftout: {
        flex: 1, 
        paddingLeft:ScreenUtil.autowidth(15), 
        alignItems:"flex-start",
    },

    center: {
        flex: 2,  
        justifyContent: 'center',
        alignItems: 'center',
    },
    titletext: {
        fontSize: ScreenUtil.setSpText(18),
    },

    Rightout: {
        flex: 1, 
        paddingRight: ScreenUtil.autowidth(15),  
        alignItems:"flex-end",
    },
    Rightimg: {
        width: ScreenUtil.autowidth(28),
    },
    Righttext: {
        fontSize:ScreenUtil.autowidth(16),
    },
});

export default Header;