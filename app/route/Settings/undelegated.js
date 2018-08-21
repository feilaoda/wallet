import React from "react";
import { connect } from "react-redux";
import { DeviceEventEmitter,  StyleSheet, Image, View, Text, TextInput} from "react-native";
import UColor from "../../utils/Colors";
import Button from "../../components/Button";
import UImage from "../../utils/Img";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast";
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
import Constants from '../../utils/Constants';
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class undelegated extends BaseComponent {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: "赎回问题",
      headerStyle: {
        paddingTop: ScreenUtil.autoheight(20),
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
      },
    };
  };

  //组件加载完成
  componentDidMount() {
    const c = this.props.navigation;
    this.props.dispatch({
      type: "wallet/getDefaultWallet",
      callback: data => {}
    });
    this.setState({
      toAccount: this.props.defaultWallet.account,
    });
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }


  // 构造函数
  constructor(props) {
    super(props);
    this.state = {
      toAccount: "",
      amount: "",
      memo: "",
      defaultWallet: null
    };
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  undelegatedRefund = () => {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
       this.setState({ error: true,errortext: '请先创建并激活钱包' });
       EasyToast.show("请先创建并激活钱包");
       return;
    }; 
    this.dismissKeyboardClick();
    const view =
    <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
            selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
            placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
        <Text style={styles.inptpasstext}></Text>  
    </View>
    EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
    if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
        EasyToast.show('密码长度至少4位,请重输');
        return;
    }
    var privateKey = this.props.defaultWallet.activePrivate;
    try {
        var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
        var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
        if (plaintext_privateKey.indexOf('eostoken') != -1) {
            plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
            EasyShowLD.loadingShow();

            Eos.transaction({
                actions: [
                    {
                        account: "eosio",
                        name: "refund", 
                        authorization: [{
                        actor: this.props.defaultWallet.account,
                        permission: 'active'
                        }], 
                        data: {
                            owner: this.props.defaultWallet.account,
                        }
                    },
                ]
            }, plaintext_privateKey, (r) => {
                EasyShowLD.loadingClose();
                if(r.isSuccess){
                    EasyToast.show("赎回成功");
                }else{
                    if(r.data){
                        if(r.data.msg){
                            EasyToast.show(r.data.msg);
                        }else{
                            EasyToast.show("赎回失败");
                        }
                    }else{
                        EasyToast.show("赎回失败");
                    }
                }
            });

        } else {
            EasyShowLD.loadingClose();
            EasyToast.show('密码错误');
        }
    } catch (e) {
        EasyShowLD.loadingClose();
        EasyToast.show('未知异常');
    }
    // EasyShowLD.dialogClose();
    }, () => { EasyShowLD.dialogClose() });
  };

  render() {
    return (
      <View style={styles.container}>     
          <View style={styles.taboutsource}>
              <Text style={styles.accountTitle}>温馨提示：</Text>
              <Text style={styles.accountText}>主网赎回EOS存在少量网络冲突问题，可能导致</Text>
              <Text style={styles.accountText}>您的EOS赎回中途卡顿，如遇此情况请点击下面</Text>
              <Text style={styles.accountText}>按钮再次激活赎回指令!</Text>
              <Button onPress={this.undelegatedRefund.bind()} style={styles.btnnextstep}>
                <View style={styles.nextstep}>
                  <Text style={styles.nextsteptext}>确认赎回</Text>
                </View>
              </Button>
          </View>
            <View style={styles.logout}>
                <Image source={UImage.bottom_log} style={styles.logimg}/>
                <Text style={styles.logtext}>EosToken 专注柚子生态</Text>
            </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: UColor.secdColor,
  },
  taboutsource: {
    flexDirection: "column",
    backgroundColor: UColor.mainColor,
    padding: ScreenUtil.autowidth(10),
    marginTop: ScreenUtil.autoheight(20),
  },

  accountTitle: {
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "left",
    lineHeight: ScreenUtil.autoheight(20),
  },
  accountText: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(30),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "left",
    lineHeight: ScreenUtil.autoheight(20),
  },
  
  
  btnnextstep: {
    height: ScreenUtil.autoheight(85),
  },
  nextstep: {
    height: ScreenUtil.autoheight(45),
    backgroundColor: UColor.tintColor,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: ScreenUtil.autowidth(120),
    marginVertical: ScreenUtil.autowidth(20),
    borderRadius: 5
  },
  nextsteptext: {
    fontSize: ScreenUtil.setSpText(15),
    color: UColor.fontColor
  },
  logout:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: ScreenUtil.autoheight(20),
  },
  logimg: {
    width: ScreenUtil.autowidth(50), 
    height: ScreenUtil.autowidth(50)
  },
  logtext: {
    fontSize: ScreenUtil.setSpText(14),
    color: UColor.arrow,
    lineHeight: ScreenUtil.autoheight(30),
  },
  tab: {
    flex: 1
  },
});
export default undelegated;
