import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter,NativeModules, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, Switch,Linking, } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import ScreenUtil from '../../utils/ScreenUtil'
import Ionicons from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import Constants from '../../utils/Constants'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var DeviceInfo = require('react-native-device-info');

@connect(({ wallet, login}) => ({ ...wallet, ...login}))
class Setting extends React.Component {

  static navigationOptions = {
    title: '我的'
  };
  
  constructor(props) {
    super(props);
    this.config = [
      { avatar:UImage.my_wallet, first: true, name: "钱包管理", onPress: this.goPage.bind(this, "WalletManage") },
      { avatar:UImage.account_manage,  name: "通讯录", onPress: this.goPage.bind(this, "AccountManage") },
      { avatar:UImage.my_share,  name: "邀请注册", onPress: this.goPage.bind(this, "share") },
      // { avatar:UImage.my_recovery, name: "密钥恢复", onPress: this.goPage.bind(this, "Test1") },
      { avatar:UImage.my_community, name: "EOS社区", onPress: this.goPage.bind(this, "Community") },
      { avatar:UImage.my_help, name: "帮助中心", onPress: this.goPage.bind(this, "Helpcenter") },
      { avatar:UImage.my_system, name: "系统设置", onPress: this.goPage.bind(this, "set") },
    ];
  }

    //组件加载完成
    componentDidMount() {
      const {dispatch}=this.props;
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }});
      DeviceEventEmitter.addListener('nativeCallRn', (msg) => {
        title = "React Native界面,收到数据：" + msg;
        // ToastAndroid.show("发送成功", ToastAndroid.SHORT);
        alert(title);
      })
    }

    
  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "share") {
      if (this.props.loginUser) {
        navigate('Share', {});
      } else {
        navigate('Login', {});
        EasyToast.show('请登陆');
      }
    } else if (key == 'WalletManage') {
      navigate('WalletManage', {});
    } else if(key == 'AccountManage') {
      navigate('addressManage', {});
    } else if (key == 'set') {
      navigate('Set', {});
    } else if (key == 'Community') {
      navigate('Community', {});
    }else if (key == 'Helpcenter') {
      navigate('Helpcenter', {});
    } else{
      EasyShowLD.dialogShow("温馨提示", "暂未开放，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  skipNativeCall() {  
    let phone = '123123123';
    NativeModules.commModule.rnCallNative(phone);  
 }  

  /** 
 * Callback 通信方式 
 */
  callbackComm(msg) {
    NativeModules.commModule.rnCallNativeFromCallback(msg, (result) => {
      alert("CallBack收到消息:" + result);
    })
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  goProfile() {
    if (this.props.loginUser) {
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Login', {});
  }

  signIn() {
    const { navigate } = this.props.navigation;
    if (this.props.loginUser) {
      navigate('SignIn', {});
    } else {
      navigate('Login', {});
      EasyToast.show('请登陆');
    }
  }

  openSystemSetting(){
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:')
        .catch(err => console.log('error', err))
    } else {
      NativeModules.OpenSettings.openNetworkSettings(data => {
        console.log('call back data', data)
      })
    }

  }

  render() {
    return <View style={styles.container}>
    {Constants.isNetWorkOffline &&
        <Button onPress={this.openSystemSetting.bind(this)}>
          <View style={styles.systemSettingTip}>
              <Text style={styles.systemSettingText}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
              <Ionicons style={styles.systemSettingArrow} name="ios-arrow-forward-outline" size={20} />
          </View>
        </Button>}
      <ScrollView style={styles.scrollView}>
        <View>
            <Button onPress={this.goProfile.bind(this)}>
              <View style={styles.userHead} >
                <View style={styles.headout}>
                  <Image source={UImage.logo} style={styles.headimg} />
                  <Text style={styles.headtext}>{(this.props.loginUser) ? this.props.loginUser.nickname : "登陆"}</Text>
                </View>
                <View style={styles.signedout}>
                  {
                    <Button onPress={this.signIn.bind(this)} style={styles.signedbtn}>
                      <Image source={UImage.signed} style={styles.signedimg} />
                    </Button>
                  }
                </View>
              </View>
            </Button>
            <Button style={styles.eosbtn}>
              <View style={styles.eosbtnout}>
                <View style={styles.eosout}>
                  <Text style={styles.eosbtntext}>活动奖励</Text>
                  <Text style={styles.eostext}>{(this.props.loginUser) ? this.props.loginUser.eost : "0"} EOS</Text>
                </View>
                <View style={styles.Withdrawout}>
                  {
                    this.props.loginUser && <Button onPress={() => { EasyShowLD.dialogShow("温馨提示", "暂未开放，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() }); }} style={styles.Withdrawbtn}>
                      <Text style={styles.Withdrawtext}>领取</Text>
                    </Button>
                  }
                </View>
              </View>
            </Button>
            <View>
              {this._renderListItem()}
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.foottext}>© 2018 eostoken all rights reserved </Text>
              <Text style={styles.foottext}>EOS专业版钱包 V{DeviceInfo.getVersion()}</Text>
              {/* <Text style={styles.foottext}>EOS专业版钱包 V2.1.9.3</Text> */}
            </View>
          </View>
      </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  scrollView: {
    flex: 1,
  },
  userHead: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: ScreenUtil.autowidth(20),
    backgroundColor: UColor.mainColor
  },
  headout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: ScreenUtil.autoheight(15),
  },
  headimg: {
    width: ScreenUtil.autowidth(42),
    height: ScreenUtil.autoheight(52),
  },
  headtext: {
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(17),
    marginLeft: ScreenUtil.autowidth(15),
  },

  signedout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end"
  },
  signedbtn: {
    borderRadius: 5,
    paddingVertical: ScreenUtil.autoheight(5),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  signedimg: {
    width: ScreenUtil.autowidth(40),
    height: ScreenUtil.autoheight(49)
  },

  eosbtn: {
    marginTop: ScreenUtil.autoheight(15),
  },
  eosbtnout: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: ScreenUtil.autowidth(20),
    backgroundColor: UColor.mainColor,
    justifyContent: 'space-between'
  },
  eosout: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: ScreenUtil.autoheight(12)
  },
  eosbtntext: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(11),
  },
  eostext: {
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(15),
    marginTop: ScreenUtil.autoheight(10),
  },

  Withdrawout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end"
  },
  Withdrawbtn: {
    backgroundColor: UColor.tintColor,
    borderRadius: 5,
    paddingVertical: ScreenUtil.autoheight(5),
    paddingHorizontal: ScreenUtil.autowidth(15),
  },
  Withdrawtext: {
    fontSize: ScreenUtil.setSpText(15),
    color: UColor.fontColor,
  },

  footer: {
    flex: 1,
    marginTop: ScreenUtil.autoheight(30),
    flexDirection: 'column'
  },
  foottext: {
    fontSize: ScreenUtil.setSpText(10),
    color: UColor.arrow,
    width: '100%',
    textAlign: 'center',
    marginTop: ScreenUtil.autoheight(5),
  },

  systemSettingTip: {
    width: ScreenWidth,
    height: ScreenUtil.autoheight(40),
    flexDirection: "row",
    alignItems: 'center', 
    backgroundColor: UColor.showy,
  },
  systemSettingText: {
    flex: 1,
    color: UColor.fontColor,
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(14)
  },
  systemSettingArrow: {
    color: UColor.fontColor,
    marginRight: ScreenUtil.autowidth(5)
  },
});

export default Setting;
