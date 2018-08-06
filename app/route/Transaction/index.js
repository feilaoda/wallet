import React from 'react';
import { connect } from 'react-redux'
import {ProgressBarAndroid,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,Slider,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { SegmentedControls } from 'react-native-radio-buttons'
import Echarts from 'native-echarts'
var ScreenWidth = Dimensions.get('window').width;
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import { EasyToast } from '../../components/Toast';

import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
import ProgressBar from '../../components/ProgressBar';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
import Constants from '../../utils/Constants';
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

const trackOption = ['最近交易','持仓大户'];
const transactionOption = ['我的交易','大盘交易'];
@connect(({ram,sticker,wallet}) => ({...ram, ...sticker, ...wallet}))
class Transaction extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: '交易',
          headerTitle: "内存交易",
          headerStyle: {
            paddingTop: Platform.OS == "ios" ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
         //铃铛small_bell/small_bell_h
        //   headerRight: (
        //     // <Button name="share" onPress={() => this._rightTopClick()} >
        //       <View style={{ padding: 15 }}>
        //       <Image source={UImage.small_bell} style={{ width: 22, height: 22 }}></Image>
        //       </View>
        //     // </Button>
        //   )
        };
      };

  constructor(props) {
    super(props);
    this.state = {
      selectedSegment:"2小时",
      selectedTrackSegment: trackOption[0],
      selectedTransactionRecord: transactionOption[1],
      isBuy: false,
      isSell: false,
      isTxRecord: true,
      isTrackRecord: false,
      balance: '0.0000',   
      slideCompletionValue: 0,
      buyRamAmount: "0",    //输入购买的额度
      eosToKB: '0.0000',
      kbToEos: '0.0000',
      sellRamBytes: "0",    //输入出售的字节数
      myRamAvailable: '0', // 我的可用字节
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      logRefreshing: false,
      newramTradeLog: []
   };
  }

  _rightTopClick = () => {
    // DeviceEventEmitter.emit(
    //   "turninShare",
    //   '{"toaccount":"' +
    //     this.props.defaultWallet.account +
    //     '","amount":"' +
    //     this.state.amount +
    //     '","symbol":"EOS"}'
    // );
  };

  componentWillMount() {

    super.componentWillMount();

    // this.props.dispatch({type: 'ram/clearRamPriceLine',payload:{}});
  }

  componentDidMount(){
      try {
        this.setState({logRefreshing: true});
        // 获取内存市场相关信息
        this.props.dispatch({type: 'ram/getRamInfo',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});
    
        // 默认获取2小时K线图
        this.fetchLine(2,'2小时');
       
        // 获取钱包信息和余额
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
            this.getAccountInfo();
        }});
        
        this.getRamTradeLog();
        
        DeviceEventEmitter.addListener('getRamInfoTimer', (data) => {
            this.onRefreshing();
        });
      } catch (error) {
        this.setState({logRefreshing: false});
      }


  }

  onRefreshing() {
    this.getRamInfo();
    this.getAccountInfo();
    if(this.state.isTxRecord){
        this.setSelectedTransactionRecord(this.state.selectedTransactionRecord, true);
    }else if(this.state.isTrackRecord){
        this.setSelectedTrackOption(this.state.selectedTrackSegment, true);
    }

  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  getRamInfo(){
    this.props.dispatch({type: 'ram/getRamInfo',payload: {}});

    // 获取曲线
    this.setSelectedOption(this.state.selectedSegment);
  }

  getRamTradeLog(){
    this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}, callback: (resp) => {
        try {
            if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
                this.setState({
                  newramTradeLog: [],
                });
              }else{
                this.setState({
                  newramTradeLog: resp.data,
                });
              }
        } catch (error) {

        }
    }}); 
  }

  getRamBigTradeLog(){
    this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}});    
  }

  getBigRamRank(){
    this.props.dispatch({type: 'ram/getBigRamRank',payload: {}});    
  }

  getAccountInfo(){
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        return;
      }
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      try {
        this.setState({ myRamAvailable:((data.total_resources.ram_bytes - data.ram_usage)).toFixed(0)});
      } catch (error) {
          
      }

    } });

    this.getBalance();

  } 

  fetchLine(type,opt){
    this.setState({selectedSegment:opt});
    InteractionManager.runAfterInteractions(() => {
        this.props.dispatch({type:'ram/getRamPriceLine',payload:{type}});
    });
  }

  setSelectedOption(opt){
    if(opt=="2小时"){
      this.fetchLine(2,opt);
    }else if(opt=="6小时"){
      this.fetchLine(6,opt);
    }else if(opt=="24小时"){
      this.fetchLine(24,opt);
    }else if(opt=="48小时"){
      this.fetchLine(48,opt);
    }
  }

  selectedTrackOption(opt){
    this.setSelectedTrackOption(opt, false);
  }

  //最近交易，持仓大户
  setSelectedTrackOption(opt, onRefreshing = false){
    if(opt== trackOption[0]){
      this.fetchTrackLine(0,opt,onRefreshing);
    }else {
      this.fetchTrackLine(1,opt,onRefreshing);
    }
  }
  fetchTrackLine(type,opt, onRefreshing = false){
    this.setState({selectedTrackSegment:opt});
    if(type == 0){
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});    
    }else{
        // EasyToast.show('开发中，查询区块持仓大户前10名记录');   
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'ram/getBigRamRank',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});
    }
  }

  selectedTransactionRecord(opt){
    this.setSelectedTransactionRecord(opt, false);
  }

  //我的交易，大盘交易
  setSelectedTransactionRecord(opt, onRefreshing = false){
    if(opt== transactionOption[0]){
      this.selectionTransaction(0,opt,onRefreshing);
    }else {
      this.selectionTransaction(1,opt,onRefreshing);
    }
  }
  selectionTransaction(type, opt, onRefreshing = false){
    this.setState({selectedTransactionRecord:opt});
    if(type == 0){
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            EasyToast.show('未检测到您的账号信息');
        }else{
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: this.props.defaultWallet.account}, callback: (resp) => {
                try {
                    if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
                        this.setState({
                          newramTradeLog: [],
                          logRefreshing: false,
                        });
                      }else{
                        this.setState({
                          newramTradeLog: resp.data,
                          logRefreshing: false
                        });
                      }
                } catch (error) {
                    this.setState({
                        logRefreshing: false
                    });
                }

            }});
        }
    }else{
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}, callback: (resp) => {
            try {
                if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
                    this.setState({
                      newramTradeLog: [],
                      logRefreshing: false,
                    });
                  }else{
                    this.setState({
                      newramTradeLog: resp.data,
                      logRefreshing: false
                    });
                  }
            } catch (error) {
                this.setState({
                    logRefreshing: false
                });
            }
        }}); 
    }
  }

  setEosBalance(balance){
    if (balance == null || balance == "") {
        this.setState({balance: '0.0000'});
      } else {
          this.setState({ balance: balance.replace("EOS", "") });
      }
  }

  getBalance() {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            this.setEosBalance(data.data);
          }
        }
      })
}

  goPage(current) {
    if (current == 'isBuy'){
        // EasyToast.show('买');
    }else if (current == 'isSell'){
        // EasyToast.show('卖');
    }else if (current == 'isTxRecord'){
        this.setSelectedTransactionRecord(this.state.selectedTransactionRecord);
    }
    else if (current == 'isTrackRecord'){
        this.setSelectedTrackOption(this.state.selectedTrackSegment);   
    } 
    // EasyShowLD.loadingClose(); 
 }
   // 更新"买，卖，交易记录，大单追踪"按钮的状态  
   _updateBtnState(currentPressed, array) { 
    if (currentPressed === 'undefined' || currentPressed === null || array === 'undefined' || array === null ) {  
        return;  
    }  
    let newState = {...this.state};  
    for (let type of array) {  
        if (currentPressed == type) {  
            newState[type] ? {} : newState[type] = !newState[type];  
            this.setState(newState);  
        } else {  
            newState[type] ? newState[type] = !newState[type] : {};  
            this.setState(newState);  
        }  
    } 
    this.goPage(currentPressed);
  }  

  funcButton(style, selectedSate, stateType, buttonTitle) {  
    let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell','isTxRecord', 'isTrackRecord'];  
    return(  
        <TouchableOpacity style={[style, selectedSate ? {backgroundColor:UColor.tintColor} : {backgroundColor: UColor.secdColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
        </TouchableOpacity>  
    );  
  } 
  transformColor(currentPressed) {
      if(currentPressed == 'isBuy'){
        return '#42B324';
      }else if(currentPressed == 'isSell'){
        return UColor.showy;
      }else{
        return UColor.tintColor;
      }
  }


  chkAccount(obj) {
      var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
      for(var i = 0 ; i < obj.length;i++){
          var tmp = obj.charAt(i);
          for(var j = 0;j < charmap.length; j++){
              if(tmp == charmap.charAt(j)){
                  break;
              }
          }
          if(j >= charmap.length){
              //非法字符
              obj = obj.replace(tmp, ""); 
              EasyToast.show('请输入正确的账号');
          }
      }
      return obj;
  }

  chkBuyEosQuantity(obj) {
      obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
      obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
      obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
      obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
      obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
      var max = 9999999999.9999;  // 100亿 -1
      var min = 0.0000;
      var value = 0.0000;
      var floatbalance;
      try {
        value = parseFloat(obj);
        floatbalance = parseFloat(this.state.balance);
      } catch (error) {
        value = 0.0000;
        floatbalance = 0.0000;
      }
      if(value < min|| value > max){
        EasyToast.show("输入错误");
        obj = "";
      }
      if (value > floatbalance) {
        EasyToast.show('账户余额不足,请重输');
        obj = "";
    }
      return obj;
  }
  chkInputSellRamBytes(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    var ram_bytes = 0;
    try {
      value = parseFloat(obj);
      ram_bytes = parseFloat(this.state.myRamAvailable);
    } catch (error) {
      value = 0.0000;
      ram_bytes = 0.0000;
    }
    if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
    }
    if (value * 1024 > ram_bytes) {
      EasyToast.show('可卖KB不足,请重输');
      obj = "";
  }
    return obj;
}

  
  chkAmountIsZero(amount,errInfo)
  {
      var tmp;
      try {
           tmp = parseFloat(amount);
        } catch (error) {
            tmp = 0;
        }
      if(tmp <= 0){
          EasyToast.show(errInfo);
          return true;
      }
      return false;
  }

  // 购买内存
  buyram = (rowData) => { 
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }

    if(this.state.buyRamAmount == ""){
        EasyToast.show('请输入购买金额');
        return;
    }
    if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
        this.setState({ buyRamAmount: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
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
                Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.props.defaultWallet.account, formatEosQua(this.state.buyRamAmount + " EOS"), (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("购买成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("购买失败");
                            }
                        }else{
                            EasyToast.show("购买失败");
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
  // 出售内存
  sellram = (rowData) => {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }
    if(this.state.sellRamBytes == ""){
        EasyToast.show('请输入出售内存KB数量');
        return;
    }
    if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存KB数量')){
        this.setState({ sellRamBytes: "" })
        return ;
    }
    this. dismissKeyboardClick();
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
                Eos.sellram(plaintext_privateKey, this.props.defaultWallet.account, (this.state.sellRamBytes * 1024).toFixed(0), (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("出售成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("出售失败");
                            }
                        }else{
                            EasyToast.show("出售失败");
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

    dismissKeyboardClick() {
      dismissKeyboard();
  }

  getTextPromp(){
    var info = "大单>2000 中单500-200 小单<500";
    return info;
  }

  //输入购买数量占总余额的比例
  getBuyRamRadio(balance)
  {
    //  var balance = this.state.balance == ""? "0.0000" :this.state.balance;
    //  var ratio = 0;             //进度条比例值
    //  try {
    //     if(this.state.buyRamAmount){
    //         if(balance){
    //             //余额存在且大于0
    //             var tmpbuyRamAmount = 0;
    //             var tmpbalance = 0; 
    //             try {
    //                 tmpbuyRamAmount = parseFloat(this.state.buyRamAmount);
    //                 tmpbalance = parseFloat(balance);
    //               } catch (error) {
    //                 tmpbuyRamAmount = 0;
    //                 tmpbalance = 0;
    //             }
    //             if(tmpbuyRamAmount > tmpbalance)
    //             {
    //                 //余额不足
    //                 this.setState({buyRamAmount:""});         
    //                 EasyToast.show("您的余额不足,请重输");           
    //             }else if(tmpbalance > 0){
    //                 ratio = tmpbuyRamAmount / tmpbalance;
    //             }
    //         }
    //     }
    //  } catch (error) {
    //     ratio = 0;
    //  }
    //  return ratio;
  }
  //输入卖掉的字节数占总字节的比例
  getSellRamRadio()
  {
     var ratio = 0;             //进度条比例值
     try {
         if(this.state.sellRamBytes)
         {
             if(this.state.myRamAvailable){
                //可用字节数存在且大于0
                var tmpsellRamBytes = 0;
                var tmpram_available = 0; 
                try {
                    tmpsellRamBytes = parseFloat(this.state.sellRamBytes);
                    tmpram_available = parseFloat(this.state.myRamAvailable);
                  } catch (error) {
                    tmpsellRamBytes = 0;
                    tmpram_available = 0;
                  }
                if(tmpsellRamBytes > tmpram_available)  
                {
                    //余额不足
                    this.setState({sellRamBytes:""});   
                    EasyToast.show("您的余额不足,请重输");        
                }else if(tmpram_available > 0){
                    ratio = tmpsellRamBytes / tmpram_available;
                } 
             }
         }
     } catch (error) {
        ratio = 0;
     }
     return ratio;
  }

  eosToKB(eos, currentPrice) {
    if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
        return '0';
    }
    return (eos/currentPrice).toFixed(4); 
  }

  kbToEos(kb, currentPrice){
    if(kb == null || kb == '' || currentPrice == null || currentPrice == ''){
        return '0.0000';
    }
    return (kb * currentPrice).toFixed(4);
  }

  openQuery =(payer) => {
    const { navigate } = this.props.navigation;
    navigate('RecordQuery', {record:payer});
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }
  
  transferTimeZone(time){
    var timezone;
    try {
        timezone = moment(time).add(8,'hours').format('YYYY-MM-DD HH:mm');
    } catch (error) {
        timezone = time;
    }
    return timezone;
  }

  render() {
    return <View style={styles.container}>
    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
      <ScrollView keyboardShouldPersistTaps="always"refreshControl={
            <RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()}
            tintColor={UColor.fontColor} colors={['#ddd', UColor.tintColor]} progressBackgroundColor={UColor.fontColor}/>}
            >
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
          <View style={styles.header}>
            <View style={styles.leftout}>
              <View style={styles.nameout}>
                <Text style={styles.nametext}>开盘</Text>
                <Text style={styles.nametext}>内存占比</Text>
                <Text style={styles.nametext}>总资金</Text>
              </View>
              <View style={styles.recordout}>
                <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.open : '0'} EOS/KB</Text>
                <View style={styles.rowout}>
                    <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.usage_ram : 0} GB/{this.props.ramInfo ? this.props.ramInfo.total_ram : 0} GB</Text>
                    <Text style={styles.ashtext}> ({((this.props.ramInfo ? this.props.ramInfo.usage_ram_percent : '0') * 100).toFixed(2)}%)</Text>
                </View>
                <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.total_eos : '0'} EOS</Text>
              </View>
            </View>
            <View style={styles.rightout}>
                <View style={styles.titleout}>
                    <Text style={styles.toptext}>涨幅</Text>
                    <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.incdo:styles.incup}> {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                </View>
                <View style={styles.presentprice}>
                    <Text style={styles.toptext}>当前价格</Text>
                    <Text style={styles.present}> {this.props.ramInfo ? this.props.ramInfo.price : '0.0000'}</Text>
                </View>
            </View>
          </View>
        <View style={styles.toptabout}>
          <SegmentedControls tint= {UColor.mainColor} selectedTint= {UColor.fontColor} onSelection={this.setSelectedOption.bind(this) }
          selectedOption={ this.state.selectedSegment } backTint= {UColor.secdColor} options={['2小时','6小时','24小时','48小时']} />
        </View>
        <View style={styles.echartsout}>
          {<Echarts option={this.props.ramLineDatas?this.props.ramLineDatas:{}} width={ScreenWidth} height={160} />}
        </View>
        {/* <View style={{justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#65CAFF'}}></View>
            <Text style={{color:'#8696B0',fontSize:11,marginLeft:5}}>价格走势</Text>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#556E95',marginLeft:10}}></View>
            <Text style={{color:'#8696B0',fontSize:11,marginLeft:5}}>交易量</Text>
        </View> */}
        <View style={styles.tablayout}>  
            {this.funcButton(styles.buytab, this.state.isBuy, 'isBuy', '买')}  
            {this.funcButton(styles.selltab, this.state.isSell, 'isSell', '卖')}  
            {this.funcButton(styles.txRecordtab, this.state.isTxRecord, 'isTxRecord', '交易记录')}  
            {this.funcButton(styles.trackRecordtab, this.state.isTrackRecord, 'isTrackRecord', '大单追踪')}  
        </View> 
         {this.state.isBuy?<View>
                <View style={styles.greeninptout}>
                    <Text style={styles.greenText}>单价: {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'} EOS/KB</Text>
                    <Text style={styles.inptTitle}>余额: {this.state.balance==""? "0.0000" :this.state.balance} EOS</Text>
                </View>
              <View style={styles.inputout}>
                  <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount + ''} returnKeyType="go" 
                  selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                  placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                  onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkBuyEosQuantity(buyRamAmount), 
                    eosToKB: this.eosToKB(buyRamAmount, this.props.ramInfo?this.props.ramInfo.price:'')})}
                  />
                <Text style={styles.unittext}>EOS</Text>
              </View>
              <View style={styles.inputout}>
                  <Text style={styles.conversion}>≈{this.state.eosToKB}</Text>
                  <Text style={styles.unittext}>KB</Text>
              </View>
              <View style={styles.inptoutsource}>
                <View style={styles.outsource}>
                    <View style={styles.progressbar}>
                        <Slider maximumValue={this.state.balance*1} minimumValue={0} step={0.0001} value={this.state.buyRamAmount*1}
                        onSlidingComplete={(value)=>this.setState({ buyRamAmount: value.toFixed(4), eosToKB: this.eosToKB(value.toFixed(4), this.props.ramInfo?this.props.ramInfo.price:'')})}
                        maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                        />
                        <View style={styles.paragraph}>
                            <Text style={styles.subsection}>0</Text>
                            <Text style={styles.subsection}>1/3</Text>     
                            <Text style={styles.subsection}>2/3</Text>
                            <Text style={styles.subsection}>ALL</Text>                                
                        </View>    
                    </View>
                    <Button onPress={this.buyram.bind(this)}>
                        <View style={styles.botn} backgroundColor={'#42B324'}>
                            <Text style={styles.botText}>买入</Text>
                        </View>
                    </Button> 
                </View>
              </View>
          </View>:  
               <View>{this.state.isSell?
                  <View>
                    <View style={styles.greeninptout}>
                        <Text style={styles.redText}>单价: {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'} EOS/KB</Text>
                        <Text style={styles.inptTitle}>可卖: {(this.state.myRamAvailable == null || this.state.myRamAvailable == '') ? '0' : (this.state.myRamAvailable/1024).toFixed(4)} KB</Text>
                    </View>
                  <View style={styles.inputout}>
                      <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes + ''} returnKeyType="go" 
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                      placeholder="输入出售数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                      onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkInputSellRamBytes(sellRamBytes), kbToEos: this.kbToEos(sellRamBytes, this.props.ramInfo?this.props.ramInfo.price:'')})}
                      />
                      <Text style={styles.unittext}>KB</Text>
                  </View>
                  <View style={styles.inputout}>
                      <Text style={styles.conversion}>≈{(this.state.kbToEos == null || this.state.kbToEos == '') ? '0' : this.state.kbToEos}</Text>
                      <Text style={styles.unittext}>EOS</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={styles.progressbar}>
                                <Slider maximumValue={this.state.myRamAvailable*1} minimumValue={0} step={0.0001} value={this.state.sellRamBytes*1024}
                                    onSlidingComplete={(value)=>this.setState({ sellRamBytes: (value/1024).toFixed(4), kbToEos: this.kbToEos(value/1024, this.props.ramInfo?this.props.ramInfo.price:'')})}
                                    maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                                    />
                                <View style={styles.paragraph}>
                                    <Text style={styles.subsection}>0</Text>
                                    <Text style={styles.subsection}>1/3</Text>     
                                    <Text style={styles.subsection}>2/3</Text>
                                    <Text style={styles.subsection}>ALL</Text>                                
                                </View> 
                            </View>
                            <Button onPress={this.sellram.bind(this)}>
                                <View style={styles.botn} backgroundColor={UColor.showy}>
                                    <Text style={styles.botText}>卖出</Text>
                                </View>
                            </Button> 
                        </View>
                </View>
            </View>:
                <View>{this.state.isTxRecord ? 
                    <View>
                        <View style={styles.toptabout}>
                            <SegmentedControls tint= {UColor.mainColor} selectedTint= {UColor.fontColor} onSelection={this.selectedTransactionRecord.bind(this) }
                                selectedOption={ this.state.selectedTransactionRecord } backTint= {UColor.secdColor} options={transactionOption} />
                        </View>
                        {(this.props.ramTradeLog  != null &&  this.props.ramTradeLog .length == 0) ? <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16, color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                        <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                                renderHeader = {()=><View style={{ flexDirection: "row", paddingHorizontal: 5,marginVertical: 2,marginHorizontal: 5,}}>
                                <Text style={{ flex: 3,paddingLeft: 8, textAlign: 'left',color: UColor.mainColor}}>账号</Text>
                                <Text style={{ flex: 4,paddingLeft: 8,textAlign: 'left',color: UColor.mainColor}}>数量(EOS)</Text>
                                <Text style={{ flex: 3,paddingLeft: 8,textAlign: 'left',color: UColor.mainColor}}>价格(KB)</Text>
                                <Text style={{ flex: 2.5,paddingLeft: 8,textAlign: 'left',color: UColor.mainColor}}>时间</Text>
                                </View>
                            }
                            dataSource={this.state.dataSource.cloneWithRows(this.state.newramTradeLog == null ? [] : this.state.newramTradeLog)} 
                            renderRow={(rowData, sectionID, rowID) => (                 
                            <Button onPress={this.openQuery.bind(this,rowData.payer)}>
                                <View style={styles.businessout}>
                                    {rowData.action_name == 'sellram' ? 
                                    <View style={styles.liststrip}>
                                        <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                        <Text style={styles.selltext} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty.replace("EOS", "")}</Text>
                                        <Text style={styles.sellpricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                        <Text style={styles.selltime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    </View>
                                    :
                                    <View style={styles.liststrip}>
                                        <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                        <Text style={styles.buytext} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                        <Text style={styles.buypricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                        <Text style={styles.buytime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    </View>
                                    }
                                </View>
                            </Button>         
                            )}                
                        /> 
                        }
                    </View>: 
            <View>
                <View style={styles.toptabout}>
                    <SegmentedControls tint= {UColor.mainColor} selectedTint= {UColor.fontColor} onSelection={this.selectedTrackOption.bind(this) }
                        selectedOption={ this.state.selectedTrackSegment } backTint= {UColor.secdColor} options={trackOption} />
                </View>
                {this.state.selectedTrackSegment == trackOption[0] ? 
                  <View>
                    {(this.props.ramBigTradeLog != null &&  this.props.ramBigTradeLog.length == 0) ? <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16, color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    renderHeader = {()=><View style={{ flexDirection: "row", paddingHorizontal: 5,marginVertical: 2,marginHorizontal: 5,}}>
                        <Text style={{ flex: 3,paddingLeft: 8, textAlign: 'left',color: UColor.mainColor}}>账号</Text>
                        <Text style={{ flex: 4,paddingLeft: 8,textAlign: 'left',color: UColor.mainColor}}>数量(EOS)</Text>
                        <Text style={{ flex: 3,paddingLeft: 8,textAlign: 'left',color: UColor.mainColor}}>价格(KB)</Text>
                        <Text style={{ flex: 2.5,paddingLeft: 8,textAlign: 'left',color: UColor.mainColor}}>时间</Text>
                        </View>
                    }
                      dataSource={this.state.dataSource.cloneWithRows(this.props.ramBigTradeLog == null ? [] : this.props.ramBigTradeLog)} 
                      renderRow={(rowData, sectionID, rowID) => (                 
                        <Button onPress={this.openQuery.bind(this,rowData.payer)}>
                            <View style={styles.businessout}>
                                {rowData.action_name == 'sellram' ? 
                                <View style={styles.liststrip}>
                                    <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                    <Text style={styles.selltext} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={styles.sellpricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                    <Text style={styles.selltime} numberOfLines={1} >{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                :
                                <View style={styles.liststrip}>
                                    <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                    <Text style={styles.buytext} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={styles.buypricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                    <Text style={styles.buytime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                }
                            </View>
                        </Button>      
                      )}                
                    /> 
                    }
                  </View> :
                  <View>
                      <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                        dataSource={this.state.dataSource.cloneWithRows(this.props.bigRamRank == null ? [] : this.props.bigRamRank)} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                            <Button onPress={this.openQuery.bind(this,rowData.account)}>
                                <View style={styles.businessRan}>
                                    <View style={styles.Rankleftout}>
                                        <Text style={styles.accounttext}>{rowData.account}</Text>
                                        <Text style={styles.numtext}>排名 {rowData.num}</Text>
                                    </View>
                                    <View style={styles.Rankcenterout}>
                                        <Text style={{fontSize: 12,color: UColor.arrow,}}>盈亏 
                                        {rowData.profit.indexOf('-') != -1 ?
                                        <Text style={{fontSize: 12, color: '#FF4C4C',}}> {rowData.profit}</Text>
                                        :
                                        <Text style={{fontSize: 12, color: '#5BD91E',}}> {rowData.profit}</Text>
                                        }
                                        </Text>
                                        <Text style={{fontSize: 12,color: UColor.arrow,}}>成本价<Text style={{ fontSize: 12,color: UColor.fontColor,}}> {rowData.historyAverageCost}</Text></Text>
                                    </View>
                                    <View style={styles.Rankrightout}>
                                        <Text style={styles.pertext}>{rowData.per}</Text>
                                        <Text style={styles.quotatext}>{rowData.ramQuota}</Text>
                                    </View>
                                </View>
                            </Button>
                        )}                
                    /> 
                  </View>
                }
                  {/* <Text style={{fontSize: 14,color: UColor.fontColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "center"}}>成交资金分布</Text>
                  <Text style={{fontSize: 12,color: UColor.tintColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "left"}}>{this.getTextPromp()}</Text> */}
                  {/* <View style={{flex:1,paddingTop:1}}>
                    {
                      <Echarts option={
                   {
                            title : {
                                text: '成交资金分布',
                                textStyle: {
                                    align: 'center',
                                    color: UColor.fontColor,
                                    fontSize: 14,
                                },
                                subtext: "大单>2000 中单500-200 小单<500",
                                subtextStyle:{
                                    align: 'left',
                                }
                            },
                            // tooltip : {
                            //     trigger: 'item',
                            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                            // },
                            legend: {
                                orient: 'vertical',
                                left: 'right',
                                top: 'middle',
                                data: ['超大','大单','大中','中单','中小','小单']
                            },
                            series : [
                                {
                                    name: '',   //访问来源
                                    type: 'pie',
                                    radius : ['40%', '70%'],
                                    center: ['35%', '60%'],
                                    hoverAnimation: false,
                                    animation:false,
                                    roam:false,
                                    silent:true,
                                    label:{
                                        show: true,
                                        position: 'inner',
                                    },
                                    data:[
                                        {value:335, name:'超大'},
                                        {value:310, name:'大单'},
                                        {value:234, name:'大中'},
                                        {value:135, name:'中单'},
                                        {value:1548, name:'中小'},
                                        {value:1548, name:'小单'}
                                    ],
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        }
                        
                        } width={ScreenWidth - 10} height={200} />
                    }
                  </View> */}
                 </View>}
               </View>}
            </View>
          }   
        </TouchableOpacity>
      </ScrollView>  
    </KeyboardAvoidingView> 
  </View>
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },
    header: {
      width: ScreenWidth,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    leftout: {
        flexDirection: "row",
        flex: 6,
        height: 50,
    },
    nameout: {
        flexDirection: 'column',
        justifyContent: 'space-around'
    },
    nametext: {
        color: '#8696B0',
        fontSize: 10,
    },
    recordout: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
        paddingLeft: 5,
    },
    recordtext: {
        color: '#fff',
        fontSize: 11,
    },
    rowout: {
        flexDirection: "row",
    },
    ashtext: {
        color: '#8696B0',
        fontSize: 11,
    },
    rightout: {
        flexDirection: 'column',
        flex: 3,
        justifyContent: 'space-between',
        height: 50,
    },
    titleout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    presentprice: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    toptext: {
        color: '#8696B0',
        fontSize: 10,
        marginTop: 5,
    },
    present: {
        color: '#fff',
        fontSize: 16,
    },

    row:{
      flex:1,
      backgroundColor:UColor.mainColor,
      flexDirection:"row",
      padding: 20,
      borderBottomColor: UColor.secdColor,
      borderBottomWidth: 0.6,
    },
    left:{
      width:'25%',
      flex:1,
      flexDirection:"column"
    },
    right:{
      width:'85%',
      flex:1,
      flexDirection:"column"
    },
    incup:{
      fontSize:20,
      color:'#F25C49',
      textAlign:'center',
    },
    incdo:{
      fontSize:20,
      color:'#25B36B',
      textAlign:'center',
    },
    toptabout: {
        padding: 10,
        paddingTop: 5
    },
    echartsout: {
        flex: 1,
        paddingTop: 10
    },
    tablayout: {   
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: UColor.secdColor,
    },
    buytab: {
        flex: 1,
        height: 33,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    selltab: {
        flex: 1,
        height: 33,
        borderTopColor: UColor.tintColor,
        borderRightColor: UColor.tintColor,
        borderBottomColor: UColor.tintColor,
        borderTopWidth: 1,
        borderRightWidth: 0.5,
        borderBottomWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    txRecordtab: {
        flex: 1,
        height: 33,
        borderTopColor: UColor.tintColor,
        borderLeftColor: UColor.tintColor,
        borderBottomColor: UColor.tintColor,
        borderTopWidth: 1,
        borderLeftWidth: 0.5,
        borderBottomWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    trackRecordtab: {
        flex: 1,
        height: 33,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
   
    inptoutsource: {
      marginTop: 10,
      paddingHorizontal: 20,
      paddingBottom: 5,
      justifyContent: 'center',
      flexDirection: 'row',  
      alignItems: 'center',
    },
    outsource: {
      flexDirection: 'row',  
      alignItems: 'center',
    },
    progressbar: {
        flex: 1,
        paddingRight: 20,
    },
    inpt: {
      flex: 1, 
      color: UColor.fontColor, 
      fontSize: 15, 
      height: 45, 
      paddingLeft: 10, 
    },
    paragraph: {
        height: 30,
        flexDirection: 'row',
        paddingHorizontal: Platform.OS == 'ios' ? 0 : 15,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subsection: {
        fontSize: 12,
        color: UColor.arrow
    },
    greeninptout: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    greenText: {
      flex:1,
      fontSize: 14, 
      color: "#42B324", 
      lineHeight: 35,
      textAlign: "left"
    },

    redText: {
      flex:1,
      fontSize: 14, 
      color: UColor.showy, 
      lineHeight: 35,
      textAlign: "left"
    },

    inptTitle: {
      flex: 1,
      fontSize: 14, 
      color: UColor.fontColor, 
      lineHeight: 35,
      textAlign: "right"
    },

    inputout: {
        height: 30,
        marginHorizontal: 18,
        marginBottom: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#38465C',
        borderRadius: 5,
    },
    conversion: {
        flex: 1,
        color: UColor.arrow,
        fontSize: 15,
        paddingLeft: 10,
    },
    unittext: {
        fontSize: 15,
        color: UColor.fontColor,
    },

    botn: {
      marginLeft: 10, 
      width: 70, 
      height: 30,  
      borderRadius: 3, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },

    botText: {
      fontSize: 17, 
      color: UColor.fontColor,
    },

    businessout: {
        height: Platform.OS == 'ios' ? 41 : 34,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: 5,
        // justifyContent: "space-between",
        borderRadius: 5,
        marginVertical: 2,
        marginHorizontal: 5,
    },
    liststrip: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        // justifyContent: "space-between",
    },
    sellpricetext: {
        flex: 3,
        fontSize: 14,
        color: '#F25C49',
        textAlign: 'left',
        paddingLeft: 8,
    },
    buypricetext: {
        flex: 3,
        fontSize: 14,
        color: "#4ed694",
        textAlign: 'left',
        paddingLeft: 8,
    },

    payertext: {
        flex: 3,
        fontSize: 14,
        color: UColor.fontColor,
        textAlign: 'left'
    },
    selltext: {
        flex: 4,
        fontSize: 14,
        color: '#F25C49',
        textAlign: 'left',
        paddingLeft: 8,
    },
    selltime: {
        flex: 2.5,
        fontSize: 12,
        color: "#F25C49",
        textAlign: 'left'
    },
    buytext: {
        flex: 4,
        fontSize: 14,
        color: "#4ed694",
        textAlign: 'left',
        paddingLeft: 8,
    },
    buytime: {
        flex: 2.5,
        fontSize: 12,
        color: "#4ed694",
        textAlign: 'left'
    },

    businessRan: {
        height: Platform.OS == 'ios' ? 52 : 45,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: 15,
        borderRadius: 5,
        marginVertical: 2,
        marginHorizontal: 5,
    },
    Rankleftout: {
        flex: 4.5,
        flexDirection: "column",
        justifyContent: "space-around",
    },
    accounttext: {
        fontSize: 15,
        color: UColor.fontColor,
    },
    numtext: {
        fontSize: 15,
        color: UColor.arrow,
    },
    Rankcenterout: {
        flex: 4.5,
        flexDirection: "column",
        justifyContent: "space-around",
    },

    Rankrightout: {
        flex: 3,
        flexDirection: "column",
        justifyContent: "space-around",
    },
    pertext: {
        fontSize: 15,
        color: UColor.fontColor,
        textAlign: 'right',
    },
    quotatext: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'right',
    },
});

export default Transaction;
