import React from 'react';
import { connect } from 'react-redux'
import {Modal,Dimensions,DeviceEventEmitter,NativeModules,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,Slider,KeyboardAvoidingView,Linking,} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { SegmentedControls } from 'react-native-radio-buttons'
import Echarts from 'native-echarts'
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
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
const transactionOption = ['最新交易','我的交易','最近大单','持仓大户'];

@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class Ram extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: '交易',
          headerTitle: "内存交易",
          headerStyle: {
            paddingTop: ScreenUtil.autoheight(20),
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
      selectedSegment:"5分",
      selectedTransactionRecord: transactionOption[0],
      isBuy: true,
      isSell: false,
      balance: '0.0000',   
      slideCompletionValue: 0,
      buyRamAmount: "0",    //输入购买的额度
      eosToKB: '0.0000',
      kbToEos: '0.0000',
      sellRamBytes: "0",    //输入出售的字节数
      myRamAvailable: '0', // 我的可用字节
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      logRefreshing: false,
      newramTradeLog: [],
      logId: "-1",

      password:"",   //买卖交易时的密码
      showMore:false,     
      showMoreTitle:"更多",
      isKLine:true,  //是否K线
      dataKLine: {},
      business: false,
      error: false,
      errortext: '',
      scrollEnabled: true, 
   };
  }

  componentWillMount() {

    super.componentWillMount();

    // this.props.dispatch({type: 'transaction/clearRamPriceLine',payload:{}});
  }

  componentDidMount(){
      try {
        this.setState({logRefreshing: true});
        // 获取内存市场相关信息
        this.props.dispatch({type: 'transaction/getRamInfo',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});
    
        // 默认获取RAM的时分图
        // this.fetchRAMLine(24,'24小时');
        // 获取曲线
        this.fetchLine(this.state.selectedSegment);
       
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
    this.setSelectedTransactionRecord(this.state.selectedTransactionRecord, true);
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  getRamInfo(){
    //取头部开盘等信息
    this.props.dispatch({type: 'transaction/getRamInfo',payload: {}});

    // 获取曲线
    this.fetchLine(this.state.selectedSegment, true);
  }
  
  getRamTradeLog(){
    this.props.dispatch({type: 'transaction/getRamTradeLog',payload: {last_id: -1}, callback: (resp) => {
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

   //获取时分图
  fetchRAMLine(type,opt, onRefreshing = false){
    InteractionManager.runAfterInteractions(() => {
        try {
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type:'transaction/getRamPriceLine',payload:{type:type}, callback: () => {
                this.setState({logRefreshing: false});
            }});
        } catch (error) {
            this.setState({logRefreshing: false});
        }

    });
  }
  //获取K线
  fetchRAMKLine(dateType,opt,onRefreshing = false){
    InteractionManager.runAfterInteractions(() => {
        try {
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type: 'transaction/getRamKLines',payload: {pageSize: "180", dateType: dateType}, callback: (resp) => {
                this.setState({logRefreshing: false});
                if(resp.code == '0'){
                    if(resp.data && resp.data.length > 0){
                    // // 数据意义：日期(record_date),开盘(open)，收盘(close)，最低(min)，最高(max),交易量(volum)
                    // var data = splitData([
                    //     ['2013/1/24', 2320.26,2320.26,2287.3,2362.94,117990000],
                    var  arrayObj = new Array();
                    for(var i = 0;i < resp.data.length;i++){
                        var elementArray = new Array("",0,0,0,0,0);
                        var element = resp.data[i];
                        if(element.record_date){
                            var timezone;
                            try {
                                timezone = moment(element.record_date).format('MM-DD HH:mm');
                            } catch (error) {
                                timezone = "";
                            }
                            elementArray[0] = timezone;
                        }   
                        if(element.open) {
                            elementArray[1] = element.open;
                        }
                        if(element.close){
                            elementArray[2] = element.close;
                        }
                        if(element.min){
                            elementArray[3] = element.min;
                        }
                        if(element.max){
                            elementArray[4] = element.max;
                        }
                        if(element.volum){
                            elementArray[5] = element.volum;
                        }
                        arrayObj[i] = elementArray;
                    }
                    var constructdata = splitData(arrayObj);
                    var echartsoption = combineRamKLine(constructdata);
                    this.setState({ dataKLine : echartsoption});
                    }else{
                    this.setState({ dataKLine : {}});
                    }
                }
            }});
        }  catch (error) {
            this.setState({ dataKLine : {}});
            this.setState({logRefreshing: false});
        }
        
    });
    
  }

  onClickTimeType(opt){
    this.fetchLine(opt);
  }

  fetchLine(opt, onRefreshing = false){
    if(opt == "时分"){
        this.setState({isKLine:false, showMore: false,selectedSegment:opt});
        this.fetchRAMLine(24,'24小时', onRefreshing);
        return ;
    }
    
    this.setState({isKLine:true, showMore: false,selectedSegment:opt});
    if(opt == "5分"){
        this.fetchRAMKLine("5m",opt, onRefreshing);
    }else if(opt == "15分"){
        this.fetchRAMKLine("15m",opt, onRefreshing);
    }else if(opt == "30分"){
        this.fetchRAMKLine("30m",opt, onRefreshing);
    }else if(opt == "1小时"){
        this.setState({showMoreTitle:opt});
        this.fetchRAMKLine("1h",opt, onRefreshing);
    }else if(opt == "1天"){
        this.setState({showMoreTitle:opt});
        this.fetchRAMKLine("1d",opt, onRefreshing);
    }else if(opt == "1周"){
        this.setState({showMoreTitle:opt});
        this.fetchRAMKLine("1w",opt, onRefreshing);
    }else if(opt == "1月"){
        this.setState({showMoreTitle:opt});
        this.fetchRAMKLine("1M",opt, onRefreshing);
    }
  }
  
   getDataLine()
   {
        return this.props.ramLineDatas ? this.props.ramLineDatas : {};
   }
   getDataKLine(){
        return this.state.dataKLine?this.state.dataKLine:{};
   }
  onClickMore(){
    this.setState({ showMore: !this.state.showMore });
  }

  selectedTransactionRecord(opt){
    this.setSelectedTransactionRecord(opt, false);
  }

  //我的交易，大盘交易
  setSelectedTransactionRecord(opt, onRefreshing = false){
    if(opt== transactionOption[0]){
      this.selectionTransaction(1,opt,onRefreshing);
    }else if(opt== transactionOption[1]){
      this.selectionTransaction(0,opt,onRefreshing);
    }else if(opt== transactionOption[2]){
       this.fetchTrackLine(0,opt,onRefreshing);
    }else if(opt== transactionOption[3]){
       this.fetchTrackLine(1,opt,onRefreshing);
    }else{

    }
  }

  fetchTrackLine(type,opt, onRefreshing = false){
    this.setState({selectedTransactionRecord:opt});
    if(type == 0){
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'transaction/getRamBigTradeLog',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});    
    }else{
        // EasyToast.show('开发中，查询区块持仓大户前10名记录');   
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'transaction/getBigRamRank',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});
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
            this.props.dispatch({type: 'transaction/getMyRamTradeLog',payload: {account_name: this.props.defaultWallet.account, last_id: "-1"}, callback: (resp) => {
                try {
                    if(resp.code != '0' || ((resp.code == '0') && (this.props.myRamTradeLog.length == 0))){
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
        this.props.dispatch({type: 'transaction/getRamTradeLog',payload: {last_id: -1}, callback: (resp) => {
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
    this.setSelectedTransactionRecord(this.state.selectedTransactionRecord);
  }  

  businesButton(style, selectedSate, stateType, buttonTitle) {  
    let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell'];  
    return(  
        <TouchableOpacity style={[style, selectedSate ? {backgroundColor:UColor.tintColor} : {backgroundColor: UColor.secdColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
        </TouchableOpacity>  
    );  
  } 

  transformColor(currentPressed) {
      if(currentPressed == 'isBuy'){
        return UColor.fallColor;
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
        //EasyToast.show('请先创建并激活钱包');
        this.setState({ error: true,errortext: '请先创建并激活钱包' });
        setTimeout(() => {
            this.setState({ error: false,errortext: '' });
        }, 2000);
        return;
    }

    if(this.state.buyRamAmount == ""||this.state.buyRamAmount == '0'){
        //EasyToast.show('请输入购买金额');
        this.setState({ error: true,errortext: '请输入购买金额' });
        setTimeout(() => {
            this.setState({ error: false,errortext: '' });
        }, 2000);
        return;
    }
    if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
        this.setState({ buyRamAmount: "" })
        return ;
    }
    this.setState({ business: false});
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password : password })} returnKeyType="go" 
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
        //EasyToast.show('请先创建并激活钱包');
        this.setState({ error: true,errortext: '请先创建并激活钱包' });
        setTimeout(() => {
            this.setState({ error: false,errortext: '' });
        }, 2000);
        return;
    }
    if(this.state.sellRamBytes == ""||this.state.sellRamBytes == '0'){
        //EasyToast.show('请输入出售内存KB数量');
        this.setState({ error: true,errortext: '请输入出售内存KB数量' });
        setTimeout(() => {
            this.setState({ error: false,errortext: '' });
        }, 2000);
        return;
    }
    if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存KB数量')){
        this.setState({ sellRamBytes: "" })
        return ;
    }
    this.setState({ business: false});
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

  eosToKB(eos, currentPrice) {
    if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
        return '0';
    }
    var ret = (eos/currentPrice).toFixed(4);
    if(ret == 'NaN')
    {
        ret = '0';
    }
    return ret; 
  }

  kbToEos(kb, currentPrice){
    if(kb == null || kb == '' || currentPrice == null || currentPrice == ''){
        return '0.0000';
    }
    var ret = (kb * currentPrice).toFixed(4);
    if(ret == 'NaN')
    {
        ret = '0';
    } 
    return ret;
  }

  openQuery =(payer) => {
      if(payer == 'busines'){
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            this.setState({ error: true,errortext: '未检测到您的账号信息' });
            setTimeout(() => {
                this.setState({ error: false,errortext: '' });
            }, 2000);
        }else{
            this.setState({ business: false});
            const { navigate } = this.props.navigation;
            navigate('RecordQueryRam', {record:this.props.defaultWallet.account});
        }
      }else{
        const { navigate } = this.props.navigation;
        navigate('RecordQueryRam', {record:payer});
      }
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

  openbusiness() {  
    let business = this.state.business;  
    this.setState({  
        business:!business,
        buyRamAmount: '0',
        sellRamBytes: '0',  
      });  
  }  

  openSystemSetting(){
    // console.log("go to set net!")
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:')
        .catch(err => console.log('error', err))
    } else {
      NativeModules.OpenSettings.openNetworkSettings(data => {
        console.log('call back data', data)
      })
    }
  }
  
  onMoveLineView() {
    this.setState({scrollEnabled: false});
    return true;
  }

  onMoveLineViewEnd(){
    this.setState({scrollEnabled: true});
    return true;
  }

  render() {
    return <View style={styles.container}>
    <TouchableOpacity style={{ position:'absolute', bottom: ScreenUtil.autoheight(45), right: 0, zIndex: 999, }}  onPress={this.openbusiness.bind(this)} activeOpacity={0.8}>
        <View style={{height: ScreenUtil.autoheight(35),width: ScreenUtil.autowidth(90),backgroundColor: UColor.tintColor,justifyContent: "center", alignItems: "center",borderTopLeftRadius: 25,borderBottomLeftRadius: 25,}}>
            <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.fontColor}}>交易面板</Text>
        </View>
    </TouchableOpacity>
    {Constants.netTimeoutFlag==true &&
        <Button onPress={this.openSystemSetting.bind(this)}>
            <View style={styles.systemSettingTip}>
                <Text style={styles.systemSettingText}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                <Ionicons style={styles.systemSettingArrow} name="ios-arrow-forward-outline" size={20} />
            </View>
        </Button>
    }
    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
      <ScrollView scrollEnabled={this.state.scrollEnabled} keyboardShouldPersistTaps="always"refreshControl={
            <RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()}
            tintColor={UColor.fontColor} colors={[UColor.riceWhite, UColor.tintColor]} progressBackgroundColor={UColor.fontColor}/>}
            >
            <View style={styles.header}>
                <View style={styles.leftout}>
                <View style={styles.nameout}>
                    <Text style={styles.nametext}>开盘</Text>
                    <Text style={styles.nametext}>内存占比</Text>
                    <Text style={styles.nametext}>总资金</Text>
                </View>
                <View style={styles.recordout}>
                    <Text style={styles.recordtext}>{this.props.ramInfo ? (this.props.ramInfo.open * 1).toFixed(4) : '0'} EOS/KB</Text>
                    <View style={styles.rowout}>
                        <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.usage_ram : 0} GB/{this.props.ramInfo ? this.props.ramInfo.total_ram : 0} GB</Text>
                        <Text style={styles.ashtext}> ({((this.props.ramInfo ? this.props.ramInfo.usage_ram_percent : '0') * 100).toFixed(2)}%)</Text>
                    </View>
                    <Text style={styles.recordtext}>{this.props.ramInfo ? (this.props.ramInfo.total_eos * 1).toFixed(4) : '0'} EOS</Text>
                </View>
                </View>
                <View style={styles.rightout}>
                    <View style={styles.presentprice}>
                        <Text style={styles.present}> {this.props.ramInfo ? (this.props.ramInfo.price * 1).toFixed(4) : '0.0000'}</Text>
                        <Text style={styles.toptext}>价格</Text>
                    </View>
                    <View style={styles.titleout}>
                        <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.incdo:styles.incup}> 
                            {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : 
                                (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                        <Text style={{color:UColor.arrow,fontSize: ScreenUtil.setSpText(13),marginTop:2,textAlign:'center', marginLeft: ScreenUtil.autowidth(5)}}>涨幅</Text>
                    </View>
                </View>
            </View>
          
            <View style={{width:ScreenWidth,height:ScreenUtil.autoheight(25),flexDirection:'row',justifyContent: 'center',alignItems:'center',backgroundColor: UColor.inash,}}>
                <View style={{flexDirection:"column",flex:1,}}>
                    <Button onPress={this.onClickTimeType.bind(this,"时分")}>
                        <View style={{ marginLeft: ScreenUtil.autowidth(2),width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(25),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            {this.state.selectedSegment == "时分" ? 
                                    <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.tintColor,}}>时分</Text> : 
                                            <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.fontColor,}}>时分</Text>}
                        </View>
                    </Button>   
                </View>
                <View style={{flexDirection:"column",flex:1,}}>
                    <Button onPress={this.onClickTimeType.bind(this,"5分")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(25),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            {this.state.selectedSegment == "5分" ? 
                                    <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.tintColor,}}>5分</Text> : 
                                            <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.fontColor,}}>5分</Text>}
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                    <Button onPress={this.onClickTimeType.bind(this,"15分")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(25),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            {this.state.selectedSegment == "15分" ? 
                                    <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.tintColor,}}>15分</Text> : 
                                            <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.fontColor,}}>15分</Text>}
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                    <Button onPress={this.onClickTimeType.bind(this,"30分")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(25),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "30分" ? 
                                    <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.tintColor,}}>30分</Text> : 
                                            <Text style={{fontSize: ScreenUtil.setSpText(15), color: UColor.fontColor,}}>30分</Text>}
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                    <Button onPress={this.onClickMore.bind(this)}>
                        <View style={{ flexDirection:"row", width: ScreenUtil.autowidth(50), height: ScreenUtil.autoheight(25),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            {(this.state.selectedSegment == "更多" || this.state.selectedSegment == "1小时" || this.state.selectedSegment == "1天"
                            || this.state.selectedSegment == "1周" || this.state.selectedSegment == "1月") ? 
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.tintColor,}}>{this.state.showMoreTitle}</Text> : 
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>{this.state.showMoreTitle}</Text>}
                            <Image source={ UImage.txbtn_more } style={ {flex:0,width: ScreenUtil.autowidth(10), height:ScreenUtil.autoheight(5),resizeMode:'contain'}}/>
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                    <Button disabled={true}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(25),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>    </Text>
                        </View>
                    </Button> 
                </View>
            </View> 

            {this.state.showMore &&       
            <View style={{width:ScreenWidth,height:ScreenUtil.autoheight(25),flexDirection:'row',justifyContent: 'center',alignItems:'center',backgroundColor: UColor.inash,}}>
                <View style={{flexDirection:"column",flex:1,}}>
                    <Button disabled={true}>
                        <View style={{ marginLeft: ScreenUtil.autowidth(2),width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(35),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>    </Text>
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1,}}>
                    <Button onPress={this.onClickTimeType.bind(this,"1小时")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(35),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>1小时</Text>
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                    <Button onPress={this.onClickTimeType.bind(this,"1天")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(35),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>1天</Text>
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                    <Button onPress={this.onClickTimeType.bind(this,"1周")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(35),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>1周</Text>
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                <Button onPress={this.onClickTimeType.bind(this,"1月")}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(35),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>1月</Text>
                        </View>
                    </Button> 
                </View>
                <View style={{flexDirection:"column",flex:1}}>
                <Button disabled={true}>
                        <View style={{ width: ScreenUtil.autowidth(40), height: ScreenUtil.autoheight(35),borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                            <Text style={{fontSize: ScreenUtil.setSpText(15),color: UColor.fontColor,}}>    </Text>
                        </View>
                    </Button> 
                </View>
            </View> 
            }  
            {this.state.isKLine ? 
                <View style={styles.echartsout} onStartShouldSetResponderCapture={this.onMoveLineView.bind(this)} onResponderRelease={this.onMoveLineViewEnd.bind(this)} onResponderEnd={this.onMoveLineViewEnd.bind(this)}>
                    {<Echarts option={this.getDataKLine()} width={ScreenWidth} height={ScreenUtil.autoheight(300)} />}
                </View>
            : 
                <View style={styles.echartsout}>
                    {<Echarts option={this.getDataLine()} width={ScreenWidth} height={ScreenUtil.autoheight(180)} />}
                </View>
            }
            <View style={styles.toptabout}>
                <SegmentedControls tint= {UColor.tintColor} selectedTint= {UColor.fontColor} onSelection={this.selectedTransactionRecord.bind(this) }
                    selectedOption={ this.state.selectedTransactionRecord } backTint= {UColor.secdColor} options={transactionOption} />
            </View>
            {this.state.selectedTransactionRecord == transactionOption[0] || this.state.selectedTransactionRecord == transactionOption[1] ? 
                <View style={{flex: 1,}}>
                    {(this.state.newramTradeLog  != null &&  this.state.newramTradeLog.length == 0) ? <View style={{paddingTop: ScreenUtil.autoheight(50), justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                            renderHeader = {()=><View style={{ flexDirection: "row", paddingHorizontal: ScreenUtil.autowidth(5),marginVertical: ScreenUtil.autoheight(2),marginHorizontal: ScreenUtil.autowidth(5),}}>
                            <Text style={{ flex: 3,paddingLeft: ScreenUtil.autowidth(8), textAlign: 'left',color: UColor.lightgray}}>账号</Text>
                            <Text style={{ flex: 4,paddingLeft: ScreenUtil.autowidth(8),textAlign: 'left',color: UColor.lightgray}}>数量(EOS)</Text>
                            <Text style={{ flex: 3.5,paddingLeft: ScreenUtil.autowidth(8),textAlign: 'left',color: UColor.lightgray}}>价格(KB)</Text>
                            <Text style={{ flex: 2.5,paddingLeft: ScreenUtil.autowidth(8),textAlign: 'left',color: UColor.lightgray}}>时间</Text>
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
                                    <Text style={styles.sellpricetext} numberOfLines={1}>{rowData.price != 0?(rowData.price * 1).toFixed(4):''}</Text>
                                    <Text style={styles.selltime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                :
                                <View style={styles.liststrip}>
                                    <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                    <Text style={styles.buytext} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={styles.buypricetext} numberOfLines={1}>{rowData.price != 0?(rowData.price * 1).toFixed(4):''}</Text>
                                    <Text style={styles.buytime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                }
                            </View>
                        </Button>         
                        )}                
                    /> 
                    }
                </View>: 
                <View style={{flex: 1,}}>
                {this.state.selectedTransactionRecord == transactionOption[2] ?  
                    <View style={{flex: 1,}}>
                        {(this.props.ramBigTradeLog != null &&  this.props.ramBigTradeLog.length == 0) ? <View style={{paddingTop: ScreenUtil.autoheight(50), justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                            <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                                renderHeader = {()=><View style={{ flexDirection: "row", paddingHorizontal: ScreenUtil.autowidth(5),marginVertical: ScreenUtil.autoheight(2),marginHorizontal: ScreenUtil.autowidth(5),}}>
                                    <Text style={{ flex: 3,paddingLeft: ScreenUtil.autowidth(8), textAlign: 'left',color: UColor.lightgray}}>账号</Text>
                                    <Text style={{ flex: 4,paddingLeft: ScreenUtil.autowidth(8),textAlign: 'left',color: UColor.lightgray}}>数量(EOS)</Text>
                                    <Text style={{ flex: 3.5,paddingLeft: ScreenUtil.autowidth(8),textAlign: 'left',color: UColor.lightgray}}>价格(KB)</Text>
                                    <Text style={{ flex: 2.5,paddingLeft: ScreenUtil.autowidth(8),textAlign: 'left',color: UColor.lightgray}}>时间</Text>
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
                                                <Text style={styles.sellpricetext} numberOfLines={1}>{rowData.price != 0?(rowData.price * 1).toFixed(4):''}</Text>
                                                <Text style={styles.selltime} numberOfLines={1} >{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                            </View>
                                            :
                                            <View style={styles.liststrip}>
                                                <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                                <Text style={styles.buytext} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                                <Text style={styles.buypricetext} numberOfLines={1}>{rowData.price != 0?(rowData.price * 1).toFixed(4):''}</Text>
                                                <Text style={styles.buytime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                            </View>
                                            }
                                        </View>
                                    </Button>      
                                )}                
                            /> 
                        }
                    </View> :
                    <View style={{flex: 1,}}>
                        <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                            dataSource={this.state.dataSource.cloneWithRows(this.props.bigRamRank == null ? [] : this.props.bigRamRank)} 
                            renderRow={(rowData, sectionID, rowID) => (                 
                                <Button onPress={this.openQuery.bind(this,rowData.account)}>
                                    <View style={styles.businessRan}>
                                        <View style={styles.Rankleftout}>
                                            <Text style={styles.accounttext} numberOfLines={1}>{rowData.account}</Text>
                                            <Text style={styles.numtext}>排名 {rowData.num}</Text>
                                        </View>
                                        <View style={styles.Rankcenterout}>
                                            <Text style={{fontSize: ScreenUtil.setSpText(14),color: UColor.arrow,}}>盈亏 
                                            {rowData.profit.indexOf('-') != -1 ?
                                            <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.riseColor,}}> {rowData.profit}</Text>
                                            :
                                            <Text style={{fontSize: ScreenUtil.setSpText(14), color: UColor.fallColor,}}> {rowData.profit}</Text>
                                            }
                                            </Text>
                                            <Text style={{fontSize: ScreenUtil.setSpText(14),color: UColor.arrow,}}>成本价<Text style={{ fontSize: ScreenUtil.setSpText(14),color: UColor.fontColor,}}> {rowData.historyAverageCost}</Text></Text>
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
            </View>}
        </ScrollView>  
    </KeyboardAvoidingView> 

    <Modal style={styles.businesmodal} animationType={'slide'} transparent={true} onRequestClose={() => {this.setState({business: false}) }} visible={this.state.business}>
        <TouchableOpacity onPress={() => this.setState({ business: false })} style={styles.businestouchable} activeOpacity={1.0}> 
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <TouchableOpacity style={styles.busines} activeOpacity={1.0}>
                    <View style={styles.businesout}>
                        <View style={styles.headbusines}>
                            <View style={styles.businestab}>  
                                {this.businesButton(styles.buytab, this.state.isBuy, 'isBuy', '买')}  
                                {this.businesButton(styles.selltab, this.state.isSell, 'isSell', '卖')}  
                            </View>
                            <View style={{flex: 1,flexDirection: 'row',}}> 
                                <TouchableOpacity onPress={this.openQuery.bind(this,'busines')} style={styles.busrecord} activeOpacity={0.8}>
                                    <Image source={ UImage.record } style={styles.busrecordimg} resizeMode= 'contain'/>
                                    <Text style={styles.busrecordtext}> 我的记录</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({ business: false })} activeOpacity={0.8}>
                                    <Image source={ UImage.redclose } style={styles.redclose}  resizeMode='contain'/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {this.state.error&&<Text style={{width: ScreenWidth, paddingHorizontal: 40, fontSize: ScreenUtil.setSpText(12), color: UColor.showy, textAlign: 'right', }}>{this.state.errortext}</Text>}
                        {this.state.isBuy?<View>
                            <View style={styles.greeninptout}>
                                <Text style={styles.greenText}>单价: {this.props.ramInfo ? (this.props.ramInfo.price * 1).toFixed(4) : '0.0000'} EOS/KB</Text>
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
                                        <View style={styles.botn} backgroundColor={UColor.fallColor}>
                                            <Text style={styles.botText}>买入</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                        </View>
                        :
                        <View>
                            <View style={styles.greeninptout}>
                                <Text style={styles.redText}>单价: {this.props.ramInfo ? (this.props.ramInfo.price * 1).toFixed(4) : '0.0000'} EOS/KB</Text>
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
                        </View>}
                    </View>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </TouchableOpacity>
    </Modal>
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
      paddingHorizontal: ScreenUtil.autowidth(6),
    },
    leftout: {
        flexDirection: "row",
        flex: 6,
        height: ScreenUtil.autoheight(50),
    },
    nameout: {
        flexDirection: 'column',
        justifyContent: 'space-around'
    },
    nametext: {
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(13),
    },
    recordout: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
        paddingLeft: ScreenUtil.autowidth(5),
    },
    recordtext: {
        color: UColor.fontColor,
        fontSize: ScreenUtil.setSpText(13),
    },
    rowout: {
        flexDirection: "row",
    },
    ashtext: {
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(13),
    },
    rightout: {
        flexDirection:'column',
        flexGrow:1,
        alignItems:"flex-end",
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
        color: UColor.arrow, 
        fontSize: ScreenUtil.setSpText(13), 
        marginTop: ScreenUtil.autoheight(2), 
        textAlign: 'center', 
        marginLeft: ScreenUtil.autowidth(5), 
        marginRight: ScreenUtil.autowidth(2),
    },
    present: {
        color: UColor.fontColor,
        fontSize: ScreenUtil.setSpText(20),
        textAlign:'center'
    },

    row:{
      flex:1,
      backgroundColor:UColor.mainColor,
      flexDirection:"row",
      padding: ScreenUtil.autowidth(20),
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
      fontSize: ScreenUtil.setSpText(20),
      color: UColor.riseColor,
      textAlign:'center',
    },
    incdo:{
      fontSize: ScreenUtil.setSpText(20),
      color: UColor.fallColor,
      textAlign:'center',
    },
    toptabout: {
        paddingHorizontal: ScreenUtil.autowidth(10),
        paddingTop:ScreenUtil.autoheight(10),
        paddingBottom: ScreenUtil.autoheight(5),
    },
    echartsout: {
        // flex: 1,
    },
    tablayout: {   
        flex: 1,
        height: ScreenUtil.autoheight(35),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(10),
        backgroundColor: UColor.secdColor,
    },
    txRecordtab: {
        flex: 1,
        height: ScreenUtil.autoheight(26),
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    trackRecordtab: {
        flex: 1,
        height: ScreenUtil.autoheight(26),
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
   
    inptoutsource: {
      marginTop: ScreenUtil.autoheight(10),
      paddingHorizontal: ScreenUtil.autowidth(20),
      paddingBottom: ScreenUtil.autoheight(5),
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
        paddingRight: ScreenUtil.autowidth(20),
    },
    inpt: {
      flex: 1, 
      color: UColor.fontColor, 
      fontSize: ScreenUtil.setSpText(15), 
      height: ScreenUtil.autoheight(45), 
      paddingLeft: ScreenUtil.autowidth(10), 
    },
    paragraph: {
        height: ScreenUtil.autoheight(30),
        flexDirection: 'row',
        paddingHorizontal: Platform.OS == 'ios' ? 0 : 15,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subsection: {
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.arrow
    },
    greeninptout: {
        height: ScreenUtil.autoheight(50),
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    greenText: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fallColor,
        textAlign: "left"
    },

    redText: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.showy,
        textAlign: "left"
    },

    inptTitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fontColor,
        textAlign: "right"
    },

    inputout: {
        height: ScreenUtil.autoheight(30),
        marginHorizontal: ScreenUtil.autowidth(18),
        marginBottom: ScreenUtil.autoheight(10),
        paddingHorizontal: ScreenUtil.autowidth(10),
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: UColor.inash,
        borderRadius: 5,
    },
    conversion: {
        flex: 1,
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(15),
        paddingLeft: ScreenUtil.autowidth(10),
    },
    unittext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor,
    },

    botn: {
      marginLeft: ScreenUtil.autowidth(10), 
      width: ScreenUtil.autowidth(70), 
      height: ScreenUtil.autoheight(30),  
      borderRadius: 3, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },

    botText: {
      fontSize: ScreenUtil.setSpText(17), 
      color: UColor.fontColor,
    },

    businessout: {
        height: ScreenUtil.autoheight(40),
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: ScreenUtil.autowidth(5),
        borderRadius: 5,
        marginVertical: ScreenUtil.autoheight(2),
        marginHorizontal: ScreenUtil.autowidth(5),
    },
    liststrip: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    sellpricetext: {
        flex: 3.5,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.riseColor,
        textAlign: 'left',
        paddingLeft: ScreenUtil.autowidth(8),
    },
    buypricetext: {
        flex: 3.5,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fallColor,
        textAlign: 'left',
        paddingLeft: ScreenUtil.autowidth(8),
    },

    payertext: {
        flex: 3,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fontColor,
        textAlign: 'left'
    },
    selltext: {
        flex: 4,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.riseColor,
        textAlign: 'left',
        paddingLeft: ScreenUtil.autowidth(8),
    },
    selltime: {
        flex: 2.5,
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.riseColor,
        textAlign: 'left'
    },
    buytext: {
        flex: 4,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fallColor,
        textAlign: 'left',
        paddingLeft: ScreenUtil.autowidth(8),
    },
    buytime: {
        flex: 2.5,
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.fallColor,
        textAlign: 'left'
    },

    businessRan: {
        height: ScreenUtil.autoheight(50),
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: ScreenUtil.autowidth(5),
        borderRadius: 5,
        marginVertical: ScreenUtil.autoheight(2),
        marginHorizontal: ScreenUtil.autowidth(5),
    },
    Rankleftout: {
        flex: 4.5,
        flexDirection: "column",
        justifyContent: "space-around",
    },
    accounttext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor,
    },
    numtext: {
        fontSize: ScreenUtil.setSpText(15),
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
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor,
        textAlign: 'right',
    },
    quotatext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        textAlign: 'right',
    },

    businesmodal: {
        flex: 1,
        flexDirection:'column',
        justifyContent: 'flex-end',
        backgroundColor: UColor.tintColor,
    },
    businestouchable: {
        flex: 1, 
        justifyContent: 'flex-end', 
        backgroundColor: UColor.mask,
    },
    busines: {
        width: ScreenWidth , 
        height:ScreenUtil.autoheight(280),
    },
    businesout: {
        flex: 1,
        backgroundColor: UColor.secdColor, 
        alignItems: 'center', 
    },
    businestab: {
        flex: 1,
        height: ScreenUtil.autoheight(40),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingLeft: ScreenUtil.autowidth(20),
        backgroundColor: UColor.secdColor,
    },
    buytab: {
        flex: 1,
        height: ScreenUtil.autoheight(26),
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    selltab: {
        flex: 1,
        height: ScreenUtil.autoheight(26),
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    busrecord: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
    },
    busrecordimg: {
        width: ScreenUtil.autowidth(12),
        height: ScreenUtil.autoheight(16),
        
    },
    busrecordtext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.tintColor,
    },
    redclose: {
        width: ScreenUtil.autowidth(40),
        height: ScreenUtil.autowidth(40),
       
    },
    headbusines: {
        width: ScreenWidth,
        height: ScreenUtil.autoheight(40),
        flexDirection: 'row',
        justifyContent: "center",
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


var upColor = '#f44961';
var downColor = '#3fcfb4';

function splitData(rawData) {
    var categoryData = [];
    var values = [];
    var volumes = [];
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i]);
        volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    }

    return {
        categoryData: categoryData,
        values: values,
        volumes: volumes
    };
}

function calculateMA(data, dayCount) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}

function combineRamKLine(data) {
    return {
        backgroundColor: "#2f3b50",
        animation: false,
        // legend: {
        //     bottom: 10,
        //     left: 'center',
        //     data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
        // },
        tooltip: {
            trigger: 'none',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: UColor.fontColor,
                    width: 0.5,
                },
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            // extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},
            label: {
                backgroundColor: '#777'
            }
        },
        // toolbox: {
        //     feature: {
        //         dataZoom: {
        //             yAxisIndex: false
        //         },
        //         brush: {
        //             type: ['lineX', 'clear']
        //         }
        //     }
        // },
        // brush: {
        //     xAxisIndex: 'all',
        //     brushLink: 'all',
        //     outOfBrush: {
        //         colorAlpha: 0.1
        //     }
        // },
        visualMap: {
            show: false,
            seriesIndex: 1,
            dimension: 2,
            pieces: [{
                value: 1,
                color: downColor
            }, {
                value: -1,
                color: upColor
            }]
        },
        color:['#ec0000','#6e6e46','#835098','#4b9373','#4b7793'],
        legend: {
            data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
            // left: '20%',
            textStyle:{
                color: "#7382a1",
                fontSize: ScreenUtil.setSpText(10),
            },
            // inactiveColor:upColor,
            itemHeight: ScreenUtil.autoheight(12),
        },
        grid: [
            {
                top: ScreenUtil.autoheight(30),
                left: ScreenUtil.autowidth(55),
                right: ScreenUtil.autowidth(20),
                height: ScreenUtil.autoheight(160),
            },
            {
                left: ScreenUtil.autowidth(55),
                right: ScreenUtil.autowidth(20),
                top: ScreenUtil.autoheight(210),
                height: ScreenUtil.autoheight(85),
                bottom: ScreenUtil.autoheight(5),
            }
        ],
        xAxis: [
            {
                type: 'category', 
                data:  data.categoryData,
                scale: true,
                boundaryGap : true,
                axisLabel: {
                    show: true,
                    color: "#7382a1",
                    fontSize: ScreenUtil.setSpText(8),
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    },
                    onZero: false,
                },
                axisTick: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    }                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: "#7382a1",
                    }
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data:  data.categoryData,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: false},
                axisTick: {show: false},
                splitLine: {show: false},
                axisLabel: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
                // axisPointer: {
                //     label: {
                //         formatter: function (params) {
                //             var seriesValue = (params.seriesData[0] || {}).value;
                //             return params.value
                //             + (seriesValue != null
                //                 ? '\n' + echarts.format.addCommas(seriesValue)
                //                 : ''
                //             );
                //         }
                //     }
                // }
            }
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    color: "#7382a1",
                    fontSize: ScreenUtil.setSpText(2),
                    formatter: function(value, index) {
                        if(value == null || value == ''){
                            return '0.0000';
                        }
                        return value.toFixed(4);
                    },
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    }
                },
                axisTick: {
                    show: true,
                    lineStyle: {
                        color: "#7382a1",
                    }                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: "#7382a1",
                    }
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {show: false},
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 50,
                end: 100
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'inside',
                top: '85%',
                start: 50,
                end: 100
            }
        ],
        series: [
            {
                name: '日K',
                type: 'candlestick',
                data: data.values ,
                itemStyle: {
                    normal: {
                        color: upColor,
                        color0: downColor,
                        borderColor: null,
                        borderColor0: null
                    }
                },
                tooltip: {
                    formatter: function (param) {
                        return [
                            // '日期:' + param.name + '<hr size=1 style="margin: 3px 0">',
                            // '开盘:' + param.data[0] + '<br/>',
                            // '收盘:' + param.data[1] + '<br/>',
                            // '最低:' + param.data[2] + '<br/>',
                            // '最高:' + param.data[3] + '<br/>'
                        ].join('');
    
                    }
                },
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: data.volumes,
            },
            {
                name: 'MA5',
                type: 'line',
                data: calculateMA(data, 5),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#6e6e46",
                        width: 1,
                    }
                }
            },
            {
                name: 'MA10',
                type: 'line',
                data: calculateMA(data, 10),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#835098",
                        width: 1,
                    }
                }
            },
            {
                name: 'MA20',
                type: 'line',
                data: calculateMA(data, 20),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#4b9373",
                        width: 1,
                    }
                }
            },
            {
                name: 'MA30',
                type: 'line',
                data: calculateMA(data, 30),
                smooth: true,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        color: "#4b7793",
                        width: 1,
                    }                
                }
            },
        ]
        
    };
}

export default Ram;
