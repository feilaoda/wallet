import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,StyleSheet,Image,ScrollView,View,Text, TextInput,Platform,Dimensions,ImageBackground,TouchableOpacity,KeyboardAvoidingView,BVLinearGradient} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/Ionicons'
import store from 'react-native-simple-store';
import LinearGradient from 'react-native-linear-gradient';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import CountDownReact from '../../components/CountDownReact'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
import ScreenUtil from '../../utils/ScreenUtil'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
import ViewShot from "react-native-view-shot";
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
import moment from 'moment';
var dismissKeyboard = require('dismissKeyboard');
const _index = 0;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Resources extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {    
          title: "资源管理",
          headerStyle: {
            paddingTop: ScreenUtil.autoheight(20),
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          }, 
          headerRight: (<Button onPress={navigation.state.params.onPress}>
            <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>抵押记录</Text>
          </Button>),       
        };
    };

    recordMortgage = () =>{  
        const { navigate } = this.props.navigation;
        navigate('MortgageRecord', {account_name: this.props.navigation.state.params.account_name});
    }  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this.recordMortgage});
    this.state = {
        isMemory: true,
        isCalculation: false,
        isNetwork: false,
        isBuyForOther: false,
        isOwn: true,
        isOthers: false,
        isLease: true,
        isTransfer: false,
        LeaseTransfer: 0,
        tetletext: '内存概况',
        column_One: '100%',
        column_Two: '100%',
        column_Three: '100%',
        ContrastOne: '0.00/0.00',
        ContrastTwo: '0.00/0.00',
        ContrastThree: '0.00/0.00',
        percentageOne: '占用（0%）',
        percentageTwo: '可用（0%）',
        percentageThree: '全网（0%）',
        currency_surplus: '0.00',
        ram_available:'0',
        Currentprice: '0',
        password: "",
        buyRamAmount: "",
        sellRamBytes: "",
        receiver: "",
        delegateb: "",
        undelegateb: "",
        init: true,
    };
  }

  componentDidMount() {
     
    try {

        // EasyShowLD.loadingShow();
        this.props.dispatch({ type: 'vote/getGlobalInfo', payload: {},});

        this.props.dispatch({
            type: 'vote/getqueryRamPrice',
            payload: {},
            callback: (data) => {
                if(data == null || data == ''){
                    return;
                }
                this.setState({Currentprice: data});
            }
        });

        this.props.dispatch({
            type: 'wallet/getDefaultWallet',
            callback: (data) => {
                this.getAccountInfo();
            }
        });
       
        this.props.dispatch({
            type: 'wallet/info',
            payload: {
                address: "1111"
            }
        });
        DeviceEventEmitter.addListener('wallet_info', (data) => {
            this.getBalance();
        });

        DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
            this.props.dispatch({
                type: 'wallet/info',
                payload: {
                    address: "1111"
                }
            });
            this.getBalance();
        });

        DeviceEventEmitter.addListener('eos_balance', (data) => {
            this.setEosBalance(data);
        });

        DeviceEventEmitter.addListener('scan_result', (data) => {
            try {
                if (data.toaccount) {
                    this.setState({
                        receiver: data.toaccount
                    });
                }
            } catch (error) {
                EasyShowLD.loadingClose();
            }
        });
    } catch (error) {
        EasyShowLD.loadingClose();
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  getAccountInfo(){

    if(this.state.init){
        this.setState({init: false});
            EasyShowLD.loadingShow();
        }

    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.navigation.state.params.account_name},callback: (data) => {
      try {
        EasyShowLD.loadingClose();
        this.setState({ 
            ram_available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(2)});
            this.getInitialization(); 

      } catch (error) {
          
      }

    } });
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.navigation.state.params.account_name , symbol: 'EOS' }, callback: (data) => {
            this.setState({ currency_surplus:data && data.data?data.data.replace('EOS', "") :'0',});
    }});
  } 

  getInitialization() {
    if(this.state.isMemory){
        this.goPage('isMemory');
      }else if(this.state.isCalculation){
        this.goPage('isCalculation');
      }else if(this.state.isNetwork){
        this.goPage('isNetwork');
      }else{
        // this.goPage('isBuyForOther');
      }   
  }

  getBalance() { 
    if (this.props.navigation.state.params != null && this.props.navigation.state.params.account_name != null) {
      this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.navigation.state.params.account_name, symbol: 'EOS' }, callback: (data) => {
            this.setEosBalance(data);
        }
      })
    } else {
      this.setState({ balance: '0'})
    }
  }
  
  setEosBalance(data){
    if (data && data.code == '0') {
        if (data.data == "") {
          this.setState({
            balance: '0',
          })
        } else {
          account: this.props.defaultWallet.name,
          this.setState({ balance: data.data.replace("EOS", ""), })
        }
      } else {
        // EasyToast.show('获取余额失败：' + data.msg);
      }
  }

    goPage(current) {
        try {
            if (current == 'isMemory'){
                this.setState({ 
                    tetletext: '内存概况',
                    column_One: (100-this.props.Resources.display_data.ram_usage_percent.replace("%", "")) + '%',
                    column_Two: (100-this.props.Resources.display_data.ram_left_percent.replace("%", "")) + '%',
                    column_Three: (100-this.props.globaldata.used_Percentage) + '%',
                    ContrastOne: this.props.Resources.display_data.ram_usage + '/' + this.props.Resources.display_data.ram_bytes,
                    ContrastTwo: this.props.Resources.display_data.ram_left + '/' + this.props.Resources.display_data.ram_bytes,
                    ContrastThree: this.props.globaldata.used + 'GB/' + this.props.globaldata.total + 'GB',
                    percentageOne: '已用(' + this.props.Resources.display_data.ram_usage_percent + ')',
                    percentageTwo: '剩余(' + this.props.Resources.display_data.ram_left_percent + ')',
                    percentageThree: '全网(' + this.props.globaldata.used_Percentage + '%)',
                })
            }else if (current == 'isCalculation'){
                this.setState({ 
                    tetletext: '计算概况',
                    column_One: (100-this.props.Resources.display_data.cpu_limit_available_percent.replace("%", "")) + '%',
                    column_Two: (100-this.props.Resources.display_data.self_delegated_bandwidth_cpu_weight_percent.replace("%", "")) + '%',
                    column_Three: ((this.props.Resources.refund_request&&this.props.Resources.refund_request.cpu_amount!="0.0000 EOS")?this.falseAlarm(this.props.Resources.display_data.refund_request_cpu_left_second_percent):'100%'),
                    ContrastOne: this.props.Resources.display_data.cpu_limit_available + '/' + this.props.Resources.display_data.cpu_limit_max,
                    ContrastTwo: (this.props.Resources.self_delegated_bandwidth?Math.floor(this.props.Resources.self_delegated_bandwidth.cpu_weight.replace("EOS", "")*100)/100:'0') + '/' + Math.floor(this.props.Resources.total_resources.cpu_weight.replace("EOS", "")*100)/100,
                    ContrastThree: ((this.props.Resources.refund_request&&this.props.Resources.refund_request.cpu_amount!="0.0000 EOS")?this.transferTimeZone(this.props.Resources.refund_request.request_time.replace("T", " ")):'00:00:00'),
                    percentageOne: '剩余(ms)',
                    percentageTwo: '抵押(EOS)',
                    percentageThree: '赎回中('+ (this.props.Resources.refund_request ? Math.floor(this.props.Resources.refund_request.cpu_amount.replace("EOS", "")*100)/100 + 'EOS' : '0.00 EOS') + ')',
                })
            }else if (current == 'isNetwork'){
                this.setState({ 
                    tetletext: '网络概况',
                    column_One: (100-this.props.Resources.display_data.net_limit_available_percent.replace("%", "")) + '%',
                    column_Two: (100-this.props.Resources.display_data.self_delegated_bandwidth_net_weight_percent.replace("%", "")) + '%',
                    column_Three: ((this.props.Resources.refund_request&&this.props.Resources.refund_request.net_amount!="0.0000 EOS")?this.falseAlarm(this.props.Resources.display_data.refund_request_net_left_second_percent):'100%'),
                    ContrastOne: this.props.Resources.display_data.net_limit_available + '/' + this.props.Resources.display_data.net_limit_max,
                    ContrastTwo: (this.props.Resources.self_delegated_bandwidth?Math.floor(this.props.Resources.self_delegated_bandwidth.net_weight.replace("EOS", "")*100)/100:'0') + '/' + Math.floor(this.props.Resources.total_resources.net_weight.replace("EOS", "")*100)/100,
                    ContrastThree: ((this.props.Resources.refund_request&&this.props.Resources.refund_request.net_amount!="0.0000 EOS")?this.transferTimeZone(this.props.Resources.refund_request.request_time.replace("T", " ")):'00:00:00'),
                    percentageOne: '剩余(kb)',
                    percentageTwo: '抵押(EOS)',
                    percentageThree: '赎回中('+ (this.props.Resources.refund_request ? Math.floor(this.props.Resources.refund_request.net_amount.replace("EOS", "")*100)/100 + 'EOS' : '0.00 EOS') + ')',
                })
            }
        } catch (error) {
            
        }
        
        // else if (current == 'isBuyForOther'){
        //     this.setState({ 
        //         tetletext: '内存交易',
        //         column_One: '0%',
        //         column_Two: '0%',
        //         column_Three: '0%',
        //         ContrastOne: '0.00/0.00',
        //         ContrastTwo: '0.00/0.00',
        //         ContrastThree: '0.00/0.00',
        //         percentageOne: '',
        //         percentageTwo: '',
        //         percentageThree: '',
        //     })
        // } 
        // EasyShowLD.loadingClose();
    }

     // 更新"内存，计算，网络，内存交易"按钮的状态  
     _updateBtnState(currentPressed, array) { 
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
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
        this.Initialization();
    }  

    Initialization() {
        this.setState({
            buyRamAmount: "",
            sellRamBytes: "",
            receiver: "",
            delegateb: "",
            undelegateb: "",
            LeaseTransfer: 0,
        })
    }

    // 返回内存，计算，网络，内存交易  
    resourceButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isMemory', 'isCalculation','isNetwork', ];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor,}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
    }  

     // 更新"自己,他人,租赁,过户"按钮的状态  
     _updateSelectedState(currentPressed, array) {  
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
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
        this.Initialization();
    }  

    // 返回自己,他人
    ownOthersButton(style, selectedSate, stateType, buttonTitle) {    
        let BTN_SELECTED_STATE_ARRAY = ['isOwn', 'isOthers'];  
        return(  
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center',alignItems: 'center', flex: 1,}} onPress={ () => {this._updateSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
              <Text style={{fontSize: 16,color: UColor.fontColor}}>{buttonTitle}</Text>  
              <View style={{width: 10, height: 10, marginHorizontal: 8, borderRadius: 3, backgroundColor: UColor.fontColor, alignItems: 'center', justifyContent: 'center',}}>
                  {selectedSate ?<View style={{width: 8, height: 8, borderRadius: 10, backgroundColor: UColor.tintColor }}/>:null}
              </View>
          </TouchableOpacity>  
        );  
    }  
    // 返回租赁,过户
    leaseTransferButton(style, selectedSate, stateType, buttonTitle) {    
        let BTN_SELECTED_STATE_ARRAY = ['isLease','isTransfer'];  
        return(  
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center',alignItems: 'center', flex: 1,}} onPress={ () => {this._updateSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
              <Text style={{fontSize: 16,color: UColor.fontColor}}>{buttonTitle}</Text>  
              <View style={{width: 10, height: 10, marginHorizontal: 8, borderRadius: 3, backgroundColor: UColor.fontColor, alignItems: 'center', justifyContent: 'center',}}>
                  {selectedSate ?<View style={{width: 8, height: 8, borderRadius: 10, backgroundColor: UColor.tintColor }}/>:null}
              </View>
          </TouchableOpacity>  
        );  
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
        if (obj == this.props.defaultWallet.account) {
            EasyToast.show('接收账号和自己账号不能相同，请重输');
            obj = "";
        }
        return obj;
    }

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

    //转换时间
    transferTimeZone(date){
        // //转换时间
        let timezone = moment(date).add(72,'hours').format('YYYY-MM-DDTHH:mm:ss');
        return  timezone;
    }
    //时间百分比防出错
    falseAlarm(timePercentage){
        let Percentage = timePercentage.replace("%", "")
        let newtimePercentage;
        if(Percentage <= 0){
            newtimePercentage = '0%'
        }else if(Percentage >= 100){
            newtimePercentage = '100%'
        }else{
            newtimePercentage = timePercentage;
        }
        return newtimePercentage
    }

    chkAmountIsZero(amount,errInfo){
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
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
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
                    if(this.state.isOwn){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, formatEosQua(this.state.buyRamAmount + " EOS"), (r) => {
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
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(this.state.sellRamBytes == ""){
            EasyToast.show('请输入出售内存kb数量');
            return;
        }
        if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存kb数量')){
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

    // 抵押
    delegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.delegateb == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        if(this.chkAmountIsZero(this.state.delegateb,'请输入抵押的EOS数量')){
            this.setState({ delegateb: "" })
            return ;
        }
        this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：抵押 {this.state.delegateb} EOS</Text>
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
                    if(this.state.isOwn){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    if(this.state.isOthers && this.state.isTransfer){
                        this.state.LeaseTransfer = 1;
                    }
                    EasyShowLD.loadingShow();
                    // 计算
                    if(this.state.isCalculation){
                        Eos.delegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, formatEosQua(this.state.delegateb + " EOS"), formatEosQua("0 EOS"), this.state.LeaseTransfer, (r) =>{
                            EasyShowLD.loadingClose();
                            if(r.isSuccess){
                                this.getAccountInfo();
                                EasyToast.show("抵押成功");
                            }else{
                                if(r.data){
                                    if(r.data.msg){
                                        EasyToast.show(r.data.msg);
                                    }else{
                                        EasyToast.show("抵押失败");
                                    }
                                }else{
                                    EasyToast.show("抵押失败");
                                }
                            }
                        });
                        // 网络
                    }else if(this.state.isNetwork){
                        Eos.delegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver,  formatEosQua("0 EOS"), formatEosQua(this.state.delegateb + " EOS"), this.state.LeaseTransfer,(r) =>{
                            EasyShowLD.loadingClose();
                            if(r.isSuccess){
                                this.getAccountInfo();
                                EasyToast.show("抵押成功");
                            }else{
                                if(r.data){
                                    if(r.data.msg){
                                        EasyToast.show(r.data.msg);
                                    }else{
                                        EasyToast.show("抵押失败");
                                    }
                                }else{
                                    EasyToast.show("抵押失败");
                                }
                            }
                        });
                    }
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
    //赎回
    undelegateb = () => { 
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.undelegateb == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }
        if(this.chkAmountIsZero(this.state.undelegateb,'请输入赎回的EOS数量')){
            this.setState({ undelegateb: "" })
            return ;
        }
        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go"  
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：赎回 {this.state.undelegateb} EOS</Text>
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
                    if(this.state.isOwn){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    EasyShowLD.loadingShow();
                    // 解除抵押
                    if(this.state.isCalculation){
                        Eos.undelegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, formatEosQua(this.state.undelegateb + " EOS"), formatEosQua("0 EOS"), (r) => {
                            EasyShowLD.loadingClose();
                            if(r.isSuccess){
                                this.getAccountInfo();
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
                        })
                    }else if(this.state.isNetwork){
                        Eos.undelegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, formatEosQua("0 EOS"), formatEosQua(this.state.undelegateb + " EOS"), (r) => {
                            EasyShowLD.loadingClose();
                            if(r.isSuccess){
                                this.getAccountInfo();
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
                        })
                    }
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
    redemption = () => { 
        const { navigate } = this.props.navigation;
        navigate('undelegated', {});
    }
    dismissKeyboardClick() {
        dismissKeyboard();
    }

    scan() {
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
    }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null} style={styles.tab}>
                    <ScrollView keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <View style={styles.tetleout}>
                                <Text style={styles.tetletext}>{this.state.tetletext}</Text>
                                <ImageBackground source={UImage.line_bg} resizeMode="cover" style={styles.linebgout}>
                                    <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                                        <View style={styles.stripbg} height={this.state.column_One}/>
                                    </ImageBackground>
                                    <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                                        <View style={styles.stripbg} height={this.state.column_Two}/>
                                    </ImageBackground>
                                    <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                                        <View style={styles.stripbg} height={this.state.column_Three}/>
                                    </ImageBackground>
                                    {/* <View style={{width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,height: (ScreenWidth - 30) * 0.307 - 5, backgroundColor: UColor.secdColor,marginBottom: Platform.OS == 'ios' ? 0.3 : 0.2,justifyContent: 'flex-end'}}>
                                        <LinearGradient colors={['#FE3BE1', '#8585EF', '#06D4FE']} style={{width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,}} height={this.state.column_One}/>
                                    </View>
                                    <View style={{width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,height: (ScreenWidth - 30) * 0.307 - 5,backgroundColor: UColor.secdColor,marginBottom: Platform.OS == 'ios' ? 0.3 : 0.2,justifyContent: 'flex-end'}}>
                                        <LinearGradient colors={['#FE3BE1', '#8585EF', '#06D4FE']} style={{width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,}} height={this.state.column_Two}/>
                                    </View>
                                    <View style={{width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,height: (ScreenWidth - 30) * 0.307 - 5,backgroundColor: UColor.secdColor,marginBottom: Platform.OS == 'ios' ? 0.3 : 0.2,justifyContent: 'flex-end'}}>
                                        <LinearGradient colors={['#FE3BE1', '#8585EF', '#06D4FE']} style={{width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236}} height={this.state.column_Three}/>
                                    </View> */}
                                </ImageBackground>
                                <View style={styles.record}>
                                    <View style={styles.recordout}>
                                        <Text style={styles.ratiotext}>{this.state.ContrastOne}</Text>
                                        <Text style={styles.recordtext}>{this.state.percentageOne}</Text>
                                    </View>
                                    <View style={styles.recordout}>
                                        <Text  style={styles.ratiotext}>{this.state.ContrastTwo}</Text>
                                        <Text style={styles.recordtext}>{this.state.percentageTwo}</Text>
                                    </View>
                                    <View style={styles.recordout}>
                                    {this.state.isCalculation||this.state.isNetwork?<CountDownReact
                                        date= {this.state.ContrastThree}
                                        hours=':'
                                        mins=':'
                                        hoursStyle={styles.ratiotext}
                                        minsStyle={styles.ratiotext}
                                        secsStyle={styles.ratiotext}
                                        firstColonStyle={styles.ratiotext}
                                        secondColonStyle={styles.ratiotext}
                                    />:<Text  style={styles.ratiotext}>{this.state.ContrastThree}</Text>}
                                        <Text style={styles.recordtext}>{this.state.percentageThree}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.tablayout}>  
                                {this.resourceButton(styles.memorytab, this.state.isMemory, 'isMemory', '内存资源')}  
                                {this.resourceButton(styles.calculationtab, this.state.isCalculation, 'isCalculation', '计算资源')}  
                                {this.resourceButton(styles.networktab, this.state.isNetwork, 'isNetwork', '网络资源')}  
                                {/* {this.resourceButton(styles.buttontab, this.state.isBuyForOther, 'isBuyForOther', '内存交易')}   */}
                            </View> 
                            {this.state.isBuyForOther?<View style={styles.nothave}><Text style={styles.copytext}>请稍候 ，程序猿玩命加班中...</Text></View>:
                            <View style={styles.nhaaout}>
                                {this.state.isMemory?<View style={styles.wterout}>
                                <View style={styles.OwnOthers}>  
                                        {this.ownOthersButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                        {this.ownOthersButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                                    </View></View>:
                                    <View style={styles.wterout}>
                                    <View style={styles.OwnOthers}>  
                                        {this.ownOthersButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                        {this.ownOthersButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                                    </View>
                                    {this.state.isOthers&&
                                    <View style={styles.LeaseTransfer}>  
                                        {this.leaseTransferButton(styles.tabbutton, this.state.isLease, 'isLease', '租赁')}  
                                        {this.leaseTransferButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', '过户')}  
                                    </View>}
                                </View> }
                                {this.state.isOwn ? null:
                                <View style={styles.inptoutsource}>
                                    {this.state.isMemory?<Text style={styles.inptTitlered}>注：帮他人购买，一旦送出将无法收回！</Text>:<Text style={styles.inptTitle}>设置接收者</Text>}
                                    <View style={styles.outsource}>
                                        <TextInput ref={(ref) => this._account = ref} value={this.state.receiver} returnKeyType="go"
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} maxLength={12}
                                            placeholder="输入接收账号" underlineColorAndroid="transparent" keyboardType="default" 
                                            onChangeText={(receiver) => this.setState({ receiver: this.chkAccount(receiver)})}
                                        />
                                        <Button onPress={() => this.scan()}>
                                            <View style={styles.botnimg}>
                                                <Image source={UImage.scan} style={{width: 26, height: 26, }} />
                                            </View>
                                        </Button> 
                                    </View>
                                </View>}  
                                {this.state.isMemory?<View>
                                    <View style={styles.inptoutsource}>
                                        <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                            <Text style={styles.inptTitle}>购买内存（{this.state.currency_surplus}EOS）</Text>
                                            <Text style={{fontSize:12, color: UColor.arrow,}}>≈{(this.state.currency_surplus == null || this.state.Currentprice == null || this.state.currency_surplus == '' || this.state.currency_surplus == '' || this.state.Currentprice == '0') ? '0.000' : (this.state.currency_surplus/this.state.Currentprice).toFixed(3)}kb</Text>
                                        </View>
                                        <View style={styles.outsource}>
                                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go" 
                                            selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                                            placeholder="输入购买的额度(EOS)" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                            onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})}
                                            />
                                            <Button onPress={this.buyram.bind(this)}>
                                                <View style={styles.botn}>
                                                    <Text style={styles.botText}>购买</Text>
                                                </View>
                                            </Button> 
                                        </View>
                                    </View>
                                    {this.state.isOthers ? null:<View style={styles.inptoutsource}>
                                        <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                            <Text style={styles.inptTitle}>出售内存（{this.state.ram_available}KB）</Text>
                                            <Text style={{fontSize:12, color: UColor.arrow,}}>≈{(this.state.ram_available*this.state.Currentprice).toFixed(3)}EOS</Text>
                                        </View>
                                        <View style={styles.outsource}>
                                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes} returnKeyType="go" 
                                            selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow}
                                            placeholder="输入出售的数量(KB)" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                            onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkPrice(sellRamBytes)})}
                                            />
                                            <Button onPress={this.sellram.bind(this)}>
                                                <View style={styles.botn}>
                                                    <Text style={styles.botText1}>出售</Text>
                                                </View>
                                            </Button> 
                                        </View>
                                    </View>}
                                </View>:
                                <View>
                                    <View style={styles.inptoutsource}>
                                        <Text style={styles.inptTitle}>抵押（EOS）</Text>
                                        <View style={styles.outsource}>
                                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegateb} returnKeyType="go" 
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                            placeholder="输入抵押数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                            onChangeText={(delegateb) => this.setState({ delegateb: this.chkPrice(delegateb)})}
                                            />
                                            <Button onPress={this.delegateb.bind()}>
                                                <View style={styles.botn}>
                                                    <Text style={styles.botText}>抵押</Text>
                                                </View>
                                            </Button> 
                                        </View>
                                    </View>
                                    {!this.state.isTransfer&&<View style={styles.inptoutsource}>
                                        <Text style={styles.inptTitle}>赎回（EOS）</Text>
                                        <View style={styles.outsource}>
                                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.undelegateb} returnKeyType="go" 
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                            placeholder="输入赎回数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                            onChangeText={(undelegateb) => this.setState({ undelegateb: this.chkPrice(undelegateb)})}   
                                            />
                                            <Button onPress={this.undelegateb.bind()}>
                                                <View style={styles.botn}>
                                                    <Text style={styles.botText}>赎回</Text>
                                                </View>
                                            </Button> 
                                        </View>
                                    </View>}
                                </View>}
                            </View>}
                            {this.state.isMemory?
                            <View style={styles.basc}>
                                <Text style={styles.basctext}>· 当前内存价格：{this.state.Currentprice}/KB</Text>
                                <Text style={styles.basctext}>· 内存资源，可以使用EOS买入，也可以出售得EOS</Text>
                            </View>
                            :
                            <View style={styles.basc}>
                                <Button onPress={this.redemption.bind()}>
                                 <View style={{ height: ScreenUtil.autoheight(30),justifyContent: 'flex-end', 
                                                alignItems: 'flex-end'  }}>
                                    <Text style={styles.basctextright}>赎回遇到问题？</Text>
                                 </View>
                                 </Button>
                                <Text style={styles.basctext}>· 获取资源需要抵押EOS。 </Text>
                                <Text style={styles.basctext}>· 抵押的EOS可撤销抵押，并于3天后退回。</Text>
                                <Text style={styles.basctext}>· 租赁抵押的EOS可自行赎回，过户抵押的EOS，将无法赎回。</Text>
                            </View>}
                        </TouchableOpacity>
                    </ScrollView>  
                </KeyboardAvoidingView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    nothave: {
        height: ScreenUtil.autoheight(80),
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        paddingHorizontal: ScreenUtil.autoheight(20),
        borderRadius: 5,
        margin: ScreenUtil.autowidth(5),
    },
    copytext: {
        fontSize: ScreenUtil.setSpText(16), 
        color: UColor.fontColor
    },
    // 密码输入框
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: ScreenUtil.autoheight(45),
        width: ScreenWidth-100,
        paddingBottom: ScreenUtil.autoheight(5),
        fontSize: ScreenUtil.setSpText(16),
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },
    inptpasstext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.lightgray,
        lineHeight: ScreenUtil.autoheight(25),
        marginTop: ScreenUtil.autoheight(5),
    },

    inptoutsource1: {
        paddingHorizontal: ScreenUtil.autowidth(20),
        paddingBottom: ScreenUtil.autoheight(20),
        justifyContent: 'center',
    },
    outsource1: {
        flexDirection: 'row',  
        alignItems: 'center',
    },
    inpt1: {
        flex: 1, 
        color: UColor.arrow, 
        fontSize: ScreenUtil.setSpText(15), 
        height: ScreenUtil.autoheight(40), 
        paddingLeft: ScreenUtil.autowidth(10), 
        backgroundColor: UColor.fontColor, 
        borderRadius: 5,
    },
    inptTitlered1: {
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.showy, 
        lineHeight: ScreenUtil.autoheight(35),
    },
    inptTitle1: {
        fontSize: ScreenUtil.setSpText(14), 
        color: UColor.arrow,
        lineHeight: ScreenUtil.autoheight(35),
    },
    botnimg1: {
        marginLeft: ScreenUtil.autowidth(10), 
        width: ScreenUtil.autowidth(86), 
        height: ScreenUtil.autoheight(38), 
        justifyContent: 'center', 
        alignItems: 'flex-start'
    },
    botn1: {
        marginLeft: ScreenUtil.autowidth(10), 
        width: ScreenUtil.autowidth(86), 
        height: ScreenUtil.autoheight(38),  
        borderRadius: 3, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    botText1: {
        fontSize: ScreenUtil.setSpText(17), 
        color: UColor.fontColor,
    },
    basc1: {
        padding: ScreenUtil.autowidth(20),
    },
    basctext1 :{
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.arrow, 
        lineHeight: ScreenUtil.autoheight(25),
    },

    tabbutton: {  
        alignItems: 'center',   
        justifyContent: 'center', 
    },  
    tablayout: {   
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingVertical: ScreenUtil.autoheight(5),
        paddingHorizontal: ScreenUtil.autowidth(15),
        backgroundColor: UColor.mainColor,
    },  
    memorytab: {
        flex: 1,
        height: ScreenUtil.autoheight(33),
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    calculationtab: {
        flex: 1,
        height: ScreenUtil.autoheight(33),
        borderTopColor: UColor.tintColor,
        borderBottomColor: UColor.tintColor,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    networktab: {
        flex: 1,
        height: ScreenUtil.autoheight(33),
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    tabText: {  
        fontSize: ScreenUtil.setSpText(14),
    }, 

    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,
    },
    nov: {
        alignItems: 'center', 
        flexDirection:'row', 
        marginHorizontal: ScreenUtil.autowidth(6),
        height: ScreenUtil.autoheight(80),  
        backgroundColor:  UColor.mainColor, 
        borderRadius: 5, 
        marginTop: ScreenUtil.autoheight(6),
    },
    imgsize: {
        width: ScreenUtil.autowidth(40), 
        height: ScreenUtil.autowidth(40), 
        marginHorizontal: ScreenUtil.autowidth(20),
    },
    novoutsource: {
        flex: 1, 
        justifyContent: "center", 
        alignItems: 'flex-start', 
        flexDirection:'column',
    },
    headtextSize: {
        fontSize: ScreenUtil.setSpText(16), 
        color: UColor.fontColor,  
        paddingBottom: ScreenUtil.autoheight(8),
    },
    textoutsource: {
        flexDirection:'row', 
        alignItems: "center",
    },
    textSizeone: {
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.arrow,
    },
    textSizetwo: {
        marginLeft: ScreenUtil.autowidth(10),
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.arrow,
    },
    arrow: {
        width: ScreenUtil.autowidth(40), 
        lineHeight: ScreenUtil.autoheight(80), 
        color: UColor.fontColor, 
        textAlign: 'center'
    },

    nhaaout: {
          backgroundColor: UColor.mainColor,
      },
      wterout: {
          flexDirection: 'row',
          paddingVertical: ScreenUtil.autoheight(10),
      },
      OwnOthers: {
          flexDirection: 'row',
          paddingHorizontal: ScreenUtil.autowidth(18),
          width: (ScreenWidth - 20) / 2,
      },
      LeaseTransfer: {
          flexDirection: 'row',
          paddingHorizontal: ScreenUtil.autowidth(18),
          width: (ScreenWidth - 20) / 2,
      },

    inptoutsource: {
        paddingHorizontal: ScreenUtil.autowidth(20),
        paddingBottom: ScreenUtil.autoheight(10),
        justifyContent: 'center',
    },
    outsource: {
        flexDirection: 'row',  
        alignItems: 'center',
        borderBottomColor: UColor.secdColor, 
        borderBottomWidth: 0.5,
    },
    inpt: {
        flex: 1, 
        color: UColor.arrow, 
        fontSize: ScreenUtil.setSpText(15), 
        height: ScreenUtil.autoheight(40), 
        paddingLeft: ScreenUtil.autowidth(10), 
    },

    inptTitle: {
        fontSize: ScreenUtil.setSpText(14), 
        color: UColor.fontColor, 
        lineHeight: ScreenUtil.autoheight(25),
    },
    inptTitlered: {
        fontSize: ScreenUtil.setSpText(14), 
        color: UColor.showy, 
        lineHeight: ScreenUtil.autoheight(35),
    },
    botnimg: {
        width: ScreenUtil.autowidth(86), 
        height: ScreenUtil.autoheight(38), 
        paddingHorizontal: ScreenUtil.autowidth(10),
        justifyContent: 'center', 
        alignItems: 'flex-end'
    },
    botn: {
        marginLeft: ScreenUtil.autowidth(10), 
        width: ScreenUtil.autowidth(70), 
        height: ScreenUtil.autoheight(30),  
        borderRadius: 3, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    botText: {
        fontSize: ScreenUtil.setSpText(17), 
        color: UColor.fontColor,
    },
    basc: {
        flex: 1,
        padding: ScreenUtil.autoheight(10),
        backgroundColor: UColor.secdColor,
    },
    basctextright :{
        flexDirection: 'row',  
        fontSize: ScreenUtil.setSpText(14), 
        color: UColor.tintColor, 
        lineHeight: ScreenUtil.autoheight(20),
        textAlign: 'right',
        borderBottomColor: UColor.tintColor, 
        borderBottomWidth: 1,
    },
    basctext :{
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.arrow, 
        lineHeight: ScreenUtil.autoheight(25),
    },

    tetleout: {
        paddingHorizontal: ScreenUtil.autowidth(15),
        paddingBottom: ScreenUtil.autoheight(10),
        backgroundColor: UColor.mainColor,
    },
    tetletext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.arrow,
        paddingVertical: ScreenUtil.autoheight(5),
    },

    linebgout: {
        width: ScreenWidth - 30,
        height: (ScreenWidth - 30) * 0.307,
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    stripbgout: {
        width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,
        height: (ScreenWidth - 30) * 0.307 - 5,
        marginBottom: Platform.OS == 'ios' ? 0.3 : 0.2,
    },
    stripbg: {
        backgroundColor: UColor.secdColor,
    },
    ratiotext: {
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.fontColor
    },
    recordtext: {
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.arrow,
    },
    record: {
        flexDirection: 'row',
    },
    recordout: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
    },

    animatedout: {
        width: ScreenWidth,
        backgroundColor: UColor.fontColor,
    },
    labelout: {
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.fontColor,
    },
    tabout: {
        width: ScreenWidth / 4,
        padding: 0,
        margin: 0
    },
    indicator: {
        borderRadius: 10,
        backgroundColor: UColor.tintColor,
        width: (ScreenWidth - 40) / 4,
        height: ScreenUtil.autoheight(30),
        marginVertical: ScreenUtil.autoheight(8),
        marginHorizontal: ScreenUtil.autowidth(5),
    },
    tabbarout: {
        height: ScreenUtil.autoheight(46),
        paddingVertical: ScreenUtil.autoheight(8),
        backgroundColor: UColor.secdColor
    },

    //弹框
    pupuo: {
        backgroundColor: UColor.riceWhite,
    },
    // modal的样式  
    modalStyle: {
        backgroundColor: UColor.mask,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    // modal上子View的样式  
    subView: {
        marginHorizontal: ScreenUtil.autowidth(10),
        backgroundColor:  UColor.fontColor,
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: UColor.baseline,
    },
    closeText: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
        marginBottom: 0,
        color: UColor.baseline,
        fontSize: ScreenUtil.setSpText(28),
    },
    // 标题  
    titleText: {
        color: UColor.blackColor,
        marginBottom: ScreenUtil.autoheight(5),
        fontSize: ScreenUtil.setSpText(18),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        margin: ScreenUtil.autowidth(20),
        alignItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
    },
    textContent: {
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(14),
        textAlign: 'left',
        lineHeight: ScreenUtil.autoheight(25),
    },
    // 按钮  
    buttonView: {
        margin: ScreenUtil.autowidth(10),
        height: ScreenUtil.autoheight(46),
        borderRadius: 6,
        backgroundColor:  UColor.showy,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: ScreenUtil.setSpText(16),
        color:  UColor.fontColor,
    },
    tab: {
        flex: 1,
    }
})
export default Resources;