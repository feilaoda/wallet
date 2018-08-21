import React from "react";
import { connect } from "react-redux";
import { DeviceEventEmitter,  StyleSheet, Image, View, Text, } from "react-native";
import UColor from "../../utils/Colors";
import Button from "../../components/Button";
import UImage from "../../utils/Img";
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast";
import BaseComponent from "../../components/BaseComponent";

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

  undelegated = () => {
    EasyToast.show("待实现");
  };

  render() {
    return (
      <View style={styles.container}>     
          <View style={styles.taboutsource}>
              <Text style={styles.accountTitle}>温馨提示：</Text>
              <Text style={styles.accountText}>主网赎回EOS存在少量网络冲突问题，可能导致</Text>
              <Text style={styles.accountText}>您的EOS赎回中途卡顿，如遇此情况请点击下面</Text>
              <Text style={styles.accountText}>按钮再次激活赎回指令!</Text>
              <Button onPress={this.undelegated.bind()} style={styles.btnnextstep}>
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
