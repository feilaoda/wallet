import React from 'react';
import { connect } from 'react-redux'
import {Clipboard,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, ImageBackground, FlatList, TouchableHighlight} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;


@connect(({login}) => ({...login}))
class Community extends BaseComponent {


  static navigationOptions = {
    title: 'EOS社区',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
      },
  };

  constructor(props) {
    super(props);
    this.state = {
        wechat: 'EOS-TOKEN',
        public: 'EosToken钱包',
        qq: '3090679927',
        telegraph: 't.me/eostokens',
        source: 'github.com/eostoken/wallet',
    }
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  
  logout = () =>{
    if(this.props.loginUser){
      this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
        this.props.navigation.goBack();
        AnalyticsUtil.onEvent('Sign_out');
      }});
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    } 
  }

  prot(key, data = {}) {
    const { navigate } = this.props.navigation; 
    if (key == 'microblog') {
        navigate('Web', { title: "官网微博", url: "http://weibo.com/eostoken" });   
    } else if(key == 'wechat'){
        // let wechat = this.state.wechat;
        Clipboard.setString(this.state.wechat);
        EasyToast.show('微信号已复制成功');
    } else if(key == 'qq'){
      // let qq = this.state.qq;
      Clipboard.setString(this.state.qq);
      EasyToast.show('QQ号已复制成功');
    }else if(key == 'public'){
      Clipboard.setString(this.state.public);
      EasyToast.show('微信公众号已复制成功');
    }else if(key == 'telegraph'){
      Clipboard.setString(this.state.telegraph);
      EasyToast.show('电报群号已复制成功');
    }else if (key == 'source') {
      navigate('Web', { title: "代码开源地址", url: "https://github.com/eostoken/wallet" });   
    }
  }
  
  render() {
    return <View style={styles.container}>    
          <Image source={UImage.cmyhead} style={styles.headimg} />
          <View style={{padding: ScreenUtil.autoheight(5),}} >
            <View style={{flexDirection:'row',}}>
              <TouchableHighlight onPress={this.prot.bind(this, 'wechat')} style={{flex: 1, marginRight: ScreenUtil.autoWidth(2.5), }} underlayColor={UColor.secdColor}>
                <ImageBackground  style={styles.wechatqq} source={UImage.cmy_wx} resizeMode="stretch">                  
                  <Text style={styles.textname}>官方微信</Text>
                  <Text style={styles.textlinktwo} >{this.state.wechat}</Text>           
                </ImageBackground>
              </TouchableHighlight>
              <TouchableHighlight onPress={this.prot.bind(this, 'qq')} style={{flex: 1, marginLeft: ScreenUtil.autoWidth(2.5),}} underlayColor={UColor.secdColor}>
                <ImageBackground style={styles.wechatqq} source={UImage.cmy_qq} resizeMode="stretch">          
                  <Text style={styles.textname}>官方QQ</Text>
                  <Text style={styles.textlinktwo} >{this.state.qq}</Text>           
                </ImageBackground>  
              </TouchableHighlight>      
            </View>
            <TouchableHighlight onPress={this.prot.bind(this, 'public')} underlayColor={UColor.secdColor}>
              <ImageBackground style={styles.publicout} source={UImage.cmy_gzh} resizeMode="stretch">              
                <Text style={styles.textname}>官方公众号</Text>
                <Text style={styles.textlinktwo}>{this.state.public}</Text>     
              </ImageBackground>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.prot.bind(this, 'microblog')} underlayColor={UColor.secdColor}>
              <ImageBackground style={styles.sourceout} source={UImage.cmy_wb} resizeMode="stretch">            
                <Text style={styles.textname}>官方微博</Text>
                <Text style={styles.textlink}>weibo.com/eostoken</Text>         
              </ImageBackground>    
            </TouchableHighlight>   
            <TouchableHighlight onPress={this.prot.bind(this, 'telegraph')} underlayColor={UColor.secdColor}>      
              <ImageBackground style={styles.sourceout} source={UImage.cmy_db} resizeMode="stretch">       
                <Text style={styles.textname}>EosToken电报群</Text>
                <Text style={styles.textlink}>{this.state.telegraph}</Text>
              </ImageBackground>   
            </TouchableHighlight>
            <TouchableHighlight onPress={this.prot.bind(this, 'source')} underlayColor={UColor.secdColor}>      
              <ImageBackground style={styles.sourceout} source={UImage.cmy_kydz} resizeMode="stretch">       
                <Text style={styles.textname}>代码开源地址</Text>
                <Text style={styles.textlink}>{this.state.source}</Text>
              </ImageBackground>   
            </TouchableHighlight>        
          </View>   
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UColor.secdColor,
  },
  headimg: {
    width: maxWidth,
    height: maxWidth * 0.2213,
    marginTop: ScreenUtil.autoheight(5),
  },
  texts: {
    height: ScreenUtil.autoheight(35),
    paddingLeft:ScreenUtil.autoWidth(20), 
    justifyContent:'center',
    alignItems:'center',  
    flexDirection:'row',
  },
  wechatqq: {
    width: (maxWidth - 15) / 2,
    height: (maxWidth - 15) / 2 * 0.6572,
    paddingHorizontal: ScreenUtil.autoWidth(10),
    paddingTop: ScreenUtil.autoheight(10),
  },
  publicout: {
    justifyContent:'center',
    width: maxWidth - 10,
    height: (maxWidth - 10) * 0.3664,
    marginTop: ScreenUtil.autoheight(5),
    paddingHorizontal: ScreenUtil.autoWidth(10),
    paddingTop: ScreenUtil.autoheight(10),
  },
  sourceout: {
    justifyContent: "space-between",
    alignItems: 'flex-start',
    width: maxWidth - 10,
    height: (maxWidth - 10) * 0.1444,
    marginTop: ScreenUtil.autoheight(5),
    paddingVertical: ScreenUtil.autoheight(5),
    paddingHorizontal: ScreenUtil.autoWidth(10),
  },
  textname: {
    fontSize: ScreenUtil.setSpText(16),
    color:'#FFFFFF',
  },
  textlinktwo: {
    paddingTop: ScreenUtil.autoheight(5),
    fontSize: ScreenUtil.setSpText(16),
    color: '#65CAFF',
    textAlign: 'left',
  },
  textlink: {
    fontSize: ScreenUtil.setSpText(16),
    color: '#65CAFF',
    textAlign: 'left',
  }

});

export default Community;
