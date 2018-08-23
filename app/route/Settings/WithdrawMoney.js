import React from 'react';
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform,  TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import moment from 'moment';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import Button from '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from "../../components/Toast"
var dismissKeyboard = require('dismissKeyboard');

@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class WithdrawMoney extends React.Component {
  static navigationOptions = {
    title: "提币记录",
    headerStyle: {
      paddingTop: ScreenUtil.autoheight(20),
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
  }

  //加载地址数据
  componentDidMount() {
   //alert(JSON.stringify(this.props.navigation.state.params.carry.data));
  }

  render() {
    const carry = this.props.navigation.state.params.carry.data;
    return (<View style={styles.container}>
            <View style={styles.package}>
              <View style={styles.leftout}>
                <Text style={styles.payertext}>提取数量：<Text style={{color: UColor.fontColor}}>{carry.eost} EOS</Text></Text>
                <Text style={styles.payertext}>接受账号：<Text style={{color: UColor.fontColor}}>{carry.eos_account}</Text></Text>
                <Text style={styles.payertext}>时间：<Text style={{color: UColor.fontColor}}>{moment(carry.createdate).format("YYYY-MM-DD HH:mm")}</Text></Text>
                {/* <Text style={styles.timetext}>时间{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text> */}
              </View>
              <View style={styles.rightout}>
                {carry.type == 'audit' && <Text style={styles.selltext}>正在审核</Text>}
                {carry.type == 'receive' && <Text style={styles.buytext}>已提取</Text>}
                {carry.type == 'notpass' && <Text style={styles.buytext}>未通过</Text>}
                <Text style={styles.presentprice}>状态</Text>
              </View>
            </View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 1,
      flexDirection: "column",
      backgroundColor: UColor.secdColor,
    },
    package: {
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      paddingHorizontal: ScreenUtil.autowidth(10),
      paddingVertical: ScreenUtil.autoheight(5),
      borderRadius: 5,
      marginHorizontal: ScreenUtil.autowidth(10),
      marginVertical: ScreenUtil.autoheight(5),
    },
    leftout: {
      flex: 3,
      flexDirection: "column",
      justifyContent: "center",
    },
    payertext: {
      color: UColor.arrow,
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    timetext: {
      color: UColor.arrow,
      fontSize: ScreenUtil.setSpText(15),
    },
    rightout: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: 'center',
    },
    selltext: {
      color: UColor.riseColor,
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    buytext: {
      color: UColor.tintColor,
      fontSize: ScreenUtil.setSpText(15),
      lineHeight: ScreenUtil.autoheight(30),
    },
    presentprice: {
      fontSize: ScreenUtil.setSpText(14),
      color: UColor.arrow,
    },
});
export default WithdrawMoney;