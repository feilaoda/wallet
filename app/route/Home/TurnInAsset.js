import React from "react";
import { connect } from "react-redux";
import { DeviceEventEmitter, Clipboard, StyleSheet, Image, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import UColor from "../../utils/Colors";
import Button from "../../components/Button";
import UImage from "../../utils/Img";
import QRCode from "react-native-qrcode-svg";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast";
import BaseComponent from "../../components/BaseComponent";
let dismissKeyboard = require("dismissKeyboard");

@connect(({ wallet }) => ({ ...wallet }))
class TurnInAsset extends BaseComponent {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: "收款信息",
      headerStyle: {
        paddingTop: ScreenUtil.autoheight(20),
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
      },
      headerRight: (
        <Button name="share" onPress={navigation.state.params.onPress}>
          <View style={{ padding: 15 }}>
          <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
          </View>
        </Button>
      )
    };
  };

  //组件加载完成
  componentDidMount() {
    const c = this.props.navigation;
    this.props.dispatch({
      type: "wallet/getDefaultWallet",
      callback: data => {}
    });
    var params = this.props.navigation.state.params.coins;
    this.setState({
      symbol:  params.asset.name,
      toAccount: this.props.defaultWallet.account,
    });
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  copy = () => {
    let address = this.props.defaultWallet.account;
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  };

  // 构造函数
  constructor(props) {
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      symbol: "",
      toAccount: "",
      amount: "",
      memo: "",
      defaultWallet: null
    };
  }

  _rightTopClick = () => {
    DeviceEventEmitter.emit(
      "turninShare",
      '{"toaccount":"' +
        this.props.defaultWallet.account +
        '","amount":"' +
        this.state.amount +
        '","symbol":"' + this.state.symbol +'"}'
    );
  };

  chkPrice(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    try {
      value = parseFloat(obj);
    } catch (error) {
      value = 0.0000;
    }
    if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
    }
    return obj;
  }
  getQRCode()
  { 
    // var  qrcode={'eos:' + this.props.defaultWallet.account + '?amount=' + ((this.state.amount == "")?'0':this.state.amount) +'&token=EOS'}
    var lowerstr;
    var upperstr;

    if(this.state.symbol == null || this.state.symbol == ""){
        lowerstr = "";
        upperstr = "";
    }else{
        lowerstr = this.state.symbol.toLowerCase();
        upperstr = this.state.symbol.toUpperCase();
    }

    var qrcode = lowerstr +':' + this.props.defaultWallet.account + 
                     '?amount=' + ((this.state.amount == "")?'0':this.state.amount) + 
                     '&token=' + upperstr;
  
    return qrcode;
  }
  clearFoucs = () => {
    this._raccount.blur();
    this._lpass.blur();
  };
  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.tab}>
          <View style={styles.taboutsource}>
            <View style={styles.outsource}>
              <Text style={styles.accountText}> 账户：{this.props.defaultWallet == null ? "" : this.props.defaultWallet.account}</Text>
              <View style={styles.codeout}>
                <View style={styles.qrcode}>
                  <QRCode size={170} style={{ width: 170 }} value = {this.getQRCode()}/>
                </View>
              </View>
              <Text style={styles.prompttext}>扫一扫，向我转账</Text>
              <View style={styles.inptoutsource}>
              <Text style={styles.tokenText} />
                <TextInput autoFocus={false} onChangeText={amount => this.setState({ amount: this.chkPrice(amount) })}
                  value = {this.state.amount} maxLength = {15} returnKeyType="go" selectionColor={UColor.tintColor}
                  style={styles.inpt} placeholderTextColor={UColor.tintColor} placeholder="请输入金额(可不填)"
                  underlineColorAndroid="transparent" secureTextEntry={false} keyboardType="numeric"
                />
                <Text style={styles.tokenText}>{this.state.symbol}</Text>
              </View>
              <Button onPress={this.copy.bind()} style={styles.btnnextstep}>
                <View style={styles.nextstep}>
                  <Text style={styles.nextsteptext}>复制账户</Text>
                </View>
              </Button>
              <View style={styles.logout}>
                  <Image source={UImage.bottom_log} style={styles.logimg}/>
                  <Text style={styles.logtext}>EosToken 专注柚子生态</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: UColor.secdColor,
    paddingTop: ScreenUtil.autoheight(5)
  },
  taboutsource: {
    flex: 1,
    flexDirection: "column"
  },
  outsource: {
    backgroundColor: UColor.secdColor,
    flexDirection: "column",
    padding: ScreenUtil.autowidth(20),
    flex: 1
  },
  accountText: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "left",
    lineHeight: ScreenUtil.autoheight(40),
  },
  codeout: {
    margin: ScreenUtil.autowidth(10),
    alignItems: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  qrcode: {
    backgroundColor: UColor.fontColor,
    padding: ScreenUtil.autowidth(5),
  },
  prompttext: {
    marginTop: ScreenUtil.autoheight(5),
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(30),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "center"
  },
  inptoutsource: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: UColor.mainColor,
    marginBottom: ScreenUtil.autoheight(10),
    paddingLeft: ScreenUtil.autowidth(10),
    justifyContent: "center",
    alignItems: "center"
  },
  tokenText: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(15),
    width: ScreenUtil.autowidth(60),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "left",
    lineHeight: ScreenUtil.autoheight(40),
  },
  inpt: {
    flex: 1,
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "center"
  },
  btnnextstep: {
    height: ScreenUtil.autoheight(85),
  },
  nextstep: {
    height: ScreenUtil.autoheight(45),
    backgroundColor: UColor.tintColor,
    justifyContent: "center",
    alignItems: "center",
    margin: ScreenUtil.autowidth(20),
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
export default TurnInAsset;
