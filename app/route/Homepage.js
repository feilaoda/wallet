/**
 * Created by zhangyanlf on 2018/2/2.
 */
import React, { Component } from 'react';
import {Dimensions, AppRegistry, Platform, StyleSheet, Text, View, TouchableOpacity,  NativeModules, ImageBackground, DeviceEventEmitter} from 'react-native';
import ScreenUtil from '../utils/ScreenUtil'
import UColor from '../utils/Colors'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

export default class Tab extends Component {
    renderItem = (route, index) => {
        const {
            navigation,
            jumpToIndex,
        } = this.props;

        const focused = index === navigation.state.index;
        const color = focused ? this.props.activeTintColor : this.props.inactiveTintColor;
        let TabScene = {
            focused:focused,
            route:route,
            tintColor:color
        };

        if(index === 2){
            return (<View
                    key={route.key}
                    style={[styles.tabItem,{backgroundColor:'transparent'}]}>
                </View>
            );
        }

        return (
            <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => jumpToIndex(index)}
            >
                <View
                    style={styles.tabItem}>
                    {this.props.renderIcon(TabScene)}
                    <Text style={{ ...styles.tabText,marginTop:ScreenUtil.autoheight(5),color }}>{this.props.getLabel(TabScene)}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    render(){
        const {navigation,jumpToIndex} = this.props;
        const {routes,} = navigation.state;
        const focused = 2 === navigation.state.index;
        const color = focused ? this.props.activeTintColor : this.props.inactiveTintColor;
        let TabScene = {
            focused:focused,
            route:routes[2],
            tintColor:color
        };
        return (<View style={{width:ScreenWidth,}}>
            <View style={styles.tab}>
                {routes && routes.map((route,index) => this.renderItem(route, index))}
            </View>
            {/*设置中间按钮凸出样式  使用绝对定位*/}
            <TouchableOpacity
                key={"centerView"}

                style={[styles.tabItem,{position:'absolute',bottom:0,left:(ScreenWidth-ScreenWidth/5)/2,right:ScreenWidth-ScreenWidth/5,height:ScreenUtil.autoheight(70)}]}
                onPress={() => jumpToIndex(2)}>
                <View style={styles.tabItem}>
                    {this.props.renderIcon(TabScene)}
                    <Text style={{ ...styles.tabText,marginTop:ScreenUtil.autoheight(10),color }}>{this.props.getLabel(TabScene)}</Text>
                </View>
            </TouchableOpacity>
        </View>);
    }
}
const styles = {
    tab:{
        width:ScreenWidth,
        backgroundColor: UColor.secdColor, 
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'flex-end',
        borderTopColor: UColor.mainColor,
        borderTopWidth: ScreenUtil.autoheight(0.2),
    },
    tabItem:{
        height:ScreenUtil.autoheight(50),
        width:ScreenWidth/5,
        alignItems:'center',
        justifyContent:'center',
    },
    tabText:{
        marginTop:ScreenUtil.autoheight(13),
        fontSize:ScreenUtil.setSpText(10),
        color:'#7b7b7b'
    },
    tabTextChoose:{
        color:'#f3474b'
    },
    tabImage:{
        width:ScreenUtil.autowidth(42),
        height:ScreenUtil.autoheight(42),
    },
};