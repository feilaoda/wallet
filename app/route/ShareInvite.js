
import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, Dimensions, Modal, Animated, View, Image, ScrollView, Text, Clipboard, ImageBackground, Linking, TextInput } from 'react-native';
import ScreenUtil from '../utils/ScreenUtil'
import UColor from '../utils/Colors'
import UImage from '../utils/Img'
import Button from '../components/Button'
const maxHeight = Dimensions.get('window').height;
const maxWidth = Dimensions.get('window').width;
import { EasyToast } from '../components/Toast';
import { EasyShowLD } from "../components/EasyShow"
import Constants from '../utils/Constants'
import ViewShot from "react-native-view-shot";
var WeChat = require('react-native-wechat');

@connect(({ invite, login }) => ({ ...invite, ...login }))
class ShareInvite extends React.Component {

  state = {
    code: "",
    focus: false
  }

  static navigationOptions = {
    title: "邀请注册"
  };

  constructor(props) {
    super(props);
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  componentDidMount() {
    var th = this;

    this.props.dispatch({
      type: "invite/info", payload: { uid: Constants.uid }, callback: (data) =>{
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              this.props.navigation.goBack();
              EasyToast.show("登陆已失效, 请重新登陆!");
            }
          });
        }
      }
    });
    // this.props.dispatch({
    //   type: "invite/getBind", payload: { uid: Constants.uid }, callback: function (data) {
        // if (data.code == "0") {
        //   if (data.data == "" || data.data == "null" || data.data == null) {
        //     const view = <TextInput autoFocus={true} onChangeText={(code) => th.setState({ code })} returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#65CAFF', width: maxWidth - 100, fontSize: 15, backgroundColor: '#EFEFEF' }} placeholderTextColor="#8696B0" placeholder="输入邀请码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8} />
        //     EasyShowLD.dialogShow("未绑定，补填邀请码", view, "绑定", "取消", () => {
        //       th.setState({ focus: true })
        //       EasyShowLD.loadingShow("绑定中");
        //       th.props.dispatch({
        //         type: "invite/bind", payload: { uid: Constants.uid, code: th.state.code }, callback: function (dt) {
        //           EasyShowLD.loadingClose()
        //           if (dt.code == "0") {
        //             EasyToast.show("绑定成功");
        //             EasyShowLD.dialogClose();
        //           } else {
        //             EasyToast.show(dt.msg);
        //           }
        //         }
        //       });
        //     }, () => { EasyShowLD.dialogClose() });
        //   }
        // }
    //   }
    // });
  }

  invitation = () => {
    // let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken上线撒币啦，500,000EOS赠送新用户活动，太爽了~真是拿到手软，用我的邀请链接注册即获得"+(parseFloat(this.props.inviteInfo.regReward)+parseFloat(this.props.inviteInfo.l1Reward))+"EOS。"+this.props.inviteInfo.inviteUrl+"#"+this.props.inviteInfo.code+"（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";
    let msg = <View>
      <Text >由硬币资本、连接资本领投的全网第一款柚子钱包EosToken开放注册了，</Text>
      <Text selectable={true} style={{paddingVertical: 5,}}>{this.props.inviteInfo.inviteUrl}</Text>
      <Text >（请复制链接到手机浏览器打开）（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）</Text>
    </View>
    EasyShowLD.dialogShow("复制成功", msg, "分享给微信好友", "取消", () => {
    this.refs.viewShot.capture().then(uri => {
      WeChat.isWXAppInstalled().then((isInstalled) => {
          EasyShowLD.dialogClose();
          if (isInstalled) {
            WeChat.shareToSession({ type: 'imageFile', imageUrl: uri })
              .catch((error) => {
                EasyToast.show(error.message);
              });
          } else {
            EasyToast.show('没有安装微信软件，请您安装微信之后再试');
          }
        });
    });
     });
  }

  render() {
    return (
      <View style={styles.container}>   
          <ScrollView> 
            <ViewShot ref="viewShot"> 
                <Image style={{width: maxWidth, height: maxWidth*1.775,}} source={UImage.sharebg} resizeMode="cover"/>  
            </ViewShot>
          </ScrollView>
          <Button onPress={() => { this.invitation() }} >
            <View style={styles.btnout}>
              <Text style={styles.btntext}>复制专属邀请链接</Text>
            </View>
          </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  btnout: {
    height: ScreenUtil.autoheight(50), 
    backgroundColor: UColor.tintColor, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  btntext: { 
    fontSize: ScreenUtil.setSpText(16), 
    color: UColor.fontColor, 
  },
});

export default ShareInvite;