import React from "react";
import { connect } from "react-redux";
import {DeviceEventEmitter,Clipboard,StyleSheet,Image,ScrollView,View,Text,TextInput,Platform,Dimensions,Modal,TouchableHighlight,TouchableOpacity} from "react-native";
import UColor from "../../utils/Colors";
import Button from "../../components/Button";
import UImage from "../../utils/Img";
import AnalyticsUtil from "../../utils/AnalyticsUtil";
import ScreenUtil from '../../utils/ScreenUtil'
import QRCode from "react-native-qrcode-svg";
const maxHeight = Dimensions.get("window").height;
import { EasyToast } from "../../components/Toast";
import BaseComponent from "../../components/BaseComponent";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require("dismissKeyboard");
@connect(({ wallet }) => ({ ...wallet }))
class TurnIn extends BaseComponent {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: "收款信息",
      headerStyle: {
        paddingTop: Platform.OS == "ios" ? 30 : 20,
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
    // var params = this.props.navigation.state.params.coins;
    this.setState({
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
        '","symbol":"EOS"}'
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
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
          <View style={styles.taboutsource}>
            <View style={styles.outsource}>
              <Text style={styles.accountText}>账户：{this.props.defaultWallet == null ? "" : this.props.defaultWallet.account}</Text>
              <View style={styles.codeout}>
                <View style={styles.qrcode}>
                  <QRCode size={170} style={{ width: 170 }} value={'eos:' + this.props.defaultWallet.account + '?amount=' + ((this.state.amount == "")?'0':this.state.amount) + '&token=EOS'}/>
                </View>
              </View>
              <Text style={styles.prompttext}>扫一扫，向我转账</Text>
              <View style={styles.inptoutsource}>
                <Text style={styles.tokenText} />
                <TextInput autoFocus={false} secureTextEntry={false} keyboardType="numeric" maxLength = {15} 
                    onChangeText={amount =>this.setState({ amount: this.chkPrice(amount) })} returnKeyType="go"
                    placeholder="请输入金额(可不填)" value = {this.state.amount} underlineColorAndroid="transparent"
                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.tintColor}
                  />
                <Text style={styles.tokenText}>EOS</Text>
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
  inptoutsource: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: UColor.mainColor,
    marginBottom: ScreenUtil.autoheight(10),
    paddingLeft: ScreenUtil.autowidth(10),
    justifyContent: "center",
    alignItems: "center"
  },
  accountoue: {
    height: ScreenUtil.autoheight(40),
    flex: 1,
    justifyContent: "center",
    flexDirection: "row"
  },

  passoutsource: {
    flexDirection: "column",
    alignItems: "center"
  },
  inptpass: {
    color: UColor.tintColor,
    height: ScreenUtil.autoheight(45),
    width: "100%",
    paddingBottom: ScreenUtil.autoheight(5),
    fontSize: ScreenUtil.setSpText(16),
    backgroundColor: UColor.fontColor,
    borderBottomColor: UColor.baseline,
    borderBottomWidth: 1
  },

  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: UColor.secdColor,
    paddingTop: ScreenUtil.autoheight(5)
  },

  row: {
    height: ScreenUtil.autoheight(90),
    backgroundColor: UColor.mainColor,
    flexDirection: "column",
    padding: ScreenUtil.autowidth(10),
    justifyContent: "space-between",
    borderRadius: 5,
    margin: ScreenUtil.autowidth(5),
  },
  top: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  footer: {
    height: ScreenUtil.autoheight(50),
    flexDirection: "row",
    position: "absolute",
    backgroundColor: UColor.secdColor,
    bottom: 0,
    left: 0,
    right: 0
  },

  // 标题
  titleText: {
    marginBottom: ScreenUtil.autoheight(10),
    fontSize: ScreenUtil.setSpText(18),
    fontWeight: "bold",
    textAlign: "center"
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

  // 内容
  accountText: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(40),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "left",
    lineHeight: ScreenUtil.autoheight(40),
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
  tab: {
    flex: 1
  },
  prompttext: {
    marginTop: ScreenUtil.autoheight(5),
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(15),
    height: ScreenUtil.autoheight(30),
    paddingLeft: ScreenUtil.autowidth(2),
    textAlign: "center"
  },
  btnamount: {
    height: ScreenUtil.autoheight(45),
    marginTop: ScreenUtil.autoheight(5),
  },
  amountstep: {
    height: ScreenUtil.autoheight(25),
    // backgroundColor: UColor.tintColor,
    justifyContent: "center",
    alignItems: "center",
    // margin: 20,
    borderRadius: 5
  },
  amountsteptext: {
    fontSize: ScreenUtil.setSpText(15),
    color: UColor.tintColor
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
  }
});
export default TurnIn;
