import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, DeviceEventEmitter, InteractionManager, Clipboard, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight,TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class TurnOut extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: '转出EOS',
            headerStyle: {
                paddingTop: ScreenUtil.autoheight(20),
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
            headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ paddingHorizontal: ScreenUtil.autowidth(10), alignItems: 'center' }}>
                <Image source={UImage.scan} style={{ width: ScreenUtil.autowidth(28), height: ScreenUtil.autowidth(28) }}></Image>
            </View>
          </Button>),
        };
    };

    //组件加载完成
    componentDidMount() {
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {
                if (data != null && data.defaultWallet.account != null) {
                    this.getBalance(data);
                } else {
                    EasyToast.show('获取账号信息失败');
                }
            }
        });
        var params = this.props.navigation.state.params.coins;
        this.setState({
            toAccount: params.toaccount,
            amount: params.amount == null ? '' : params.amount,
            name: params.name,
        })
        DeviceEventEmitter.addListener('scan_result', (data) => {
            this.setState({toAccount:data.toaccount})
            if(data.amount){
                this.setState({amount:data.amount})
            }
        });
        DeviceEventEmitter.addListener('eos_balance', (data) => {
            this.setEosBalance(data);
          });
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        DeviceEventEmitter.removeListener('scan_result');
      }

    setEosBalance(data){
        if (data.code == '0') {
            if (data.data == "") {
                this.setState({ balance: '0.0000' })
            } else {
                this.setState({ balance: data.data.replace("EOS", "") })
            }
        } else {
            // EasyToast.show('获取余额失败：' + data.msg);
        }
    }

    getBalance(data) {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: data.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
                this.setEosBalance(data);
            }
        })
    }

    onPress(action) {
        EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }

    _rightButtonClick() {
        //   console.log('右侧按钮点击了');  
        if (this.state.toAccount == null || this.state.toAccount == "") {
            EasyToast.show('请输入收款账号');
            return;  
        }
        
        if (this.state.amount == null || this.state.amount == "") {
            EasyToast.show('请输入转账金额');
            return;
        }
        var value;
        var floatbalance;
        try {
            value = parseFloat(this.state.amount);
            floatbalance = parseFloat(this.state.balance);
          } catch (error) {
            value = 0;
          }
        if(value <= 0){
            this.setState({ amount: "" })
            EasyToast.show('请输入转账金额');
            return ;
        }
        if(value > floatbalance){
            this.setState({ amount: "" })
            EasyToast.show('账户余额不足,请重输');
            return ;
        }
        this._setModalVisible();
        this.clearFoucs();
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    // 构造函数  
    constructor(props) {
        super(props);
        this.props.navigation.setParams({ onPress: this._rightTopClick });
        this.state = {
            show: false,
            toAccount: '',
            amount: '',
            memo: '',
            defaultWallet: null,
            balance: '0',
            name: '',
        };
    }

    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.name});
      }

    goPage(coinType) {
        const { navigate } = this.props.navigation;
        navigate('addressManage', { coinType });
    }
    inputPwd = () => {

        this._setModalVisible();

        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass}  maxLength={Constants.PWD_MAX_LENGTH} 
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyShowLD.dialogShow("密码", view, "确认", "取消", () => {
                
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    EasyShowLD.loadingShow();
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transfer("eosio.token", this.props.defaultWallet.account, this.state.toAccount, formatEosQua(this.state.amount + " EOS"), this.state.memo, plaintext_privateKey, true, (r) => {
                        EasyShowLD.loadingClose();
                        if(r && r.isSuccess){
                            this.props.dispatch({type: 'wallet/pushTransaction', payload: { from: this.props.defaultWallet.account, to: this.state.toAccount, amount: this.state.amount + " EOS", memo: this.state.memo, data: "push"}});
                            AnalyticsUtil.onEvent('Turn_out');
                            EasyToast.show('交易成功');
                            DeviceEventEmitter.emit('transaction_success');
                            this.props.navigation.goBack();
                        }else{
                            if(r && r.data){
                                if(r.data.code){
                                    var errcode = r.data.code;
                                    if(errcode == 3080002 || errcode == 3080003|| errcode == 3080004 || errcode == 3080005
                                        || errcode == 3081001)
                                    {
                                      this.props.dispatch({type:'wallet/getFreeMortgage',payload:{username:this.props.defaultWallet.account},callback:(resp)=>{ 
                                        if(resp.code == 608)
                                        { 
                                            //弹出提示框,可申请免费抵押功能
                                            const view =
                                            <View style={styles.passoutsource}>
                                            <Text style={styles.Explaintext}>该账号资源(NET/CPU)不足!EosToken官方提供免费抵押功能,您可以使用免费抵押后再进行该操作。</Text>
                                            </View>
                                            EasyShowLD.dialogShow("资源受限", view, "申请免费抵押", "放弃", () => {
                                                
                                            const { navigate } = this.props.navigation;
                                            navigate('FreeMortgage', {});
                                            // EasyShowLD.dialogClose();
                                            }, () => { EasyShowLD.dialogClose() });
                                        }
                                    }});
                                    }
                                }
                                if(r.data.msg){
                                    EasyToast.show(r.data.msg);
                                }else{
                                    EasyToast.show("交易失败");
                                }
                            }else{
                                EasyToast.show("交易失败");
                            }
                        }
                    });
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
            // EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    }

    chkLast(obj) {
        if (obj.substr((obj.length - 1), 1) == '.') {
            obj = obj.substr(0, (obj.length - 1));
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
        if (obj == this.props.defaultWallet.account) {
            EasyToast.show('收款账户和转出账户不能相同，请重输');
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

    clearFoucs = () => {
        this._raccount.blur();
        // this._lpass.blur();
        this._ramount.blur();
        this._rnote.blur();
    }
    
    openAddressBook() {
        const { navigate } = this.props.navigation;
        navigate('addressManage', {isTurnOut:true,coinType:this.state.name});
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        return (
        <View style={styles.container}>
            <ScrollView  keyboardShouldPersistTaps="always">
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.header}>
                            <Text style={styles.headertext}>{this.state.balance.replace("EOS", "")} EOS</Text>
                        </View>
                        <View style={styles.taboutsource}>
                            <View style={styles.outsource}>
                                <View style={styles.inptoutsource}>
                                    <View style={styles.accountoue} >
                                        <Text style={styles.inptitle}>账户名称</Text>
                                        <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}      
                                            placeholder="收款人账号" underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                            onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})} 
                                        />
                                    </View>
                                    <View style={styles.scanning}>
                                        <Button onPress={() => this.openAddressBook()}>                                  
                                            <Image source={UImage.al} style={styles.scanningimg} />                                 
                                        </Button>
                                    </View>
                                </View>
                                <View style={styles.textinptoue} >
                                    <Text style={styles.inptitle}>转账数量</Text>
                                    <TextInput  ref={ (ref) => this._ramount = ref} value={this.state.amount} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow} 
                                        placeholder="输入转账数量"  underlineColorAndroid="transparent"   keyboardType="numeric"   maxLength = {15}
                                        onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                        />
                                </View>
                                <View style={styles.textinptoue} >
                                    <Text style={styles.inptitle}>备注</Text>
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow}
                                        placeholder="Memo" underlineColorAndroid="transparent" keyboardType="default" 
                                        onChangeText={(memo) => this.setState({ memo })}
                                        />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
                <View style={styles.warningout}>
                    <Image source={UImage.warning} style={styles.imgBtn} />
                    <Text style={styles.headtitle}>温馨提示:如果您是向交易所转账,请务必填写相应的备注(MEMO)信息,否则可能无法到账。</Text>
                </View>
                <Button onPress={this._rightButtonClick.bind(this)} style={styles.btnnextstep}>
                    <View style={styles.nextstep}>
                        <Text style={styles.nextsteptext}>下一步</Text>
                    </View>
                </Button>
            </ScrollView>
            <View style={styles.pupuo}>
                <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <TouchableOpacity style={styles.modalStyle} activeOpacity={1.0}>  
                        <View style={{ width: ScreenWidth,  height: ScreenHeight*4/6,  backgroundColor: UColor.fontColor,}}>
                            <View style={styles.subView}>
                                <Text style={styles.buttontext}/>
                                <Text style={styles.titleText}>订单详情</Text>
                                <Button  onPress={this._setModalVisible.bind(this)} style={styles.buttonView}>
                                    <Text style={styles.buttontext}>×</Text>
                                </Button>
                            </View>
                                <View style={styles.separationline} >
                                <Text style={styles.amounttext}>{this.state.amount} </Text>
                                <Text style={styles.unittext}> EOS</Text>
                            </View>
                            <View style={{flex: 1,}}>
                                <View style={styles.separationline} >
                                    <Text style={styles.explainText}>收款账户：</Text>
                                    <Text style={styles.contentText}>{this.state.toAccount}</Text>
                                </View>
                                <View style={styles.separationline} >
                                    <Text style={styles.explainText}>转出账户：</Text>
                                    <Text style={styles.contentText}>{this.props.defaultWallet.account}</Text>
                                </View>
                                <View style={styles.separationline} >
                                    <Text style={styles.explainText}>备注：</Text> 
                                    <Text style={styles.contentText} numberOfLines={1}>{this.state.memo}</Text> 
                                </View>
                                {this.state.memo== ""&&
                                <View style={styles.warningoutShow}>
                                    <Image source={UImage.warning} style={styles.imgBtn} />
                                    <Text style={styles.headtitle}>温馨提示：如果您是向交易所转账，请务必填写相应的备注（MEMO）信息，否则可能无法到账。</Text>
                                </View>}
                                
                                <Button onPress={() => { this.inputPwd() }}>
                                    <View style={styles.btnoutsource}>
                                        <Text style={styles.btntext}>确认</Text>
                                    </View>
                                </Button>
                            </View>
                    </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </View>
        )
    }
}
const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height:  ScreenUtil.autoheight(45),
        width: ScreenWidth-100,
        paddingBottom:  ScreenUtil.autoheight(5),
        fontSize: ScreenUtil.setSpText(16),
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop:  ScreenUtil.autoheight(5),
    },
    header: {
        height:  ScreenUtil.autoheight(110),
        justifyContent: "center",
        alignItems: "center",
        margin: ScreenUtil.autowidth(5),
        borderRadius: 5,
        backgroundColor: UColor.mainColor,
    },
    headertext: {
        fontSize: ScreenUtil.setSpText(20),
        color: UColor.fontColor
    },
    row: {
        height:  ScreenUtil.autoheight(90),
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
        alignItems: 'center',
    },
    footer: {
        height:  ScreenUtil.autoheight(50),
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: UColor.secdColor,
        bottom: 0,
        left: 0,
        right: 0,
    },

    pupuo: {
        backgroundColor: UColor.riceWhite,
    },
    // modal的样式  
    modalStyle: {
        flex: 1, 
        justifyContent: 'flex-end', 
        alignItems: 'center',
    },
    // modal上子View的样式  
    subView: {
        flexDirection: "row", 
        height:  ScreenUtil.autoheight(50), 
        alignItems: 'center'
    },
    buttonView: {
        justifyContent: 'center', 
        alignItems: 'center',
    },
    buttontext: {
        width:  ScreenUtil.autoheight(50),
        color: UColor.baseline,
        fontSize: ScreenUtil.setSpText(28),
        textAlign: 'center',
    },
    // 标题  
    titleText: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(18),
        fontWeight: 'bold',
        color: UColor.blackColor, 
        textAlign:'center'
    },
    // 内容  
    explainText: {
        fontSize: ScreenUtil.setSpText(18),
        textAlign: 'left',
        color: UColor.secdColor,
    },
    contentText: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(18),
        textAlign: 'right',
        color: UColor.secdColor,
    },

    //转帐信息提示分隔线
    separationline: {
        height:  ScreenUtil.autoheight(50),
        paddingHorizontal: ScreenUtil.autowidth(20),
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: UColor.lightgray,
        justifyContent: 'center',
        alignItems: 'center'
    },

    amounttext: {
        fontSize: ScreenUtil.setSpText(25),
        paddingVertical: ScreenUtil.autoheight(15), 
        lineHeight: ScreenUtil.autoheight(10),
        color:UColor.blackColor,
        textAlign: 'center',
    },
    unittext: {
        fontSize: ScreenUtil.setSpText(13),
        paddingVertical: ScreenUtil.autoheight(10), 
        lineHeight: ScreenUtil.autoheight(10),
        color:UColor.blackColor,
        textAlign: 'center',
    },

    // 按钮  
    btnoutsource: {
        margin: ScreenUtil.autowidth(15),
        height:  ScreenUtil.autoheight(45),
        borderRadius: 6,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(16),
        color: UColor.fontColor
    },
   
    taboutsource: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource: {
        backgroundColor: UColor.secdColor,
        flexDirection: 'column',
        padding: ScreenUtil.autowidth(20),
        flex: 1,
    },
    inptoutsource: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: UColor.mainColor,
        marginBottom:  ScreenUtil.autoheight(10),
        paddingLeft: ScreenUtil.autowidth(5),
    },
    accountoue: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: "column",
    },

    inpt: {
        flex: 1,
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(14),
        height: ScreenUtil.autoheight(40),
    },
    scanning: {
        width:  ScreenUtil.autoheight(40),
        flexDirection: "row",
        alignSelf: 'center',
        justifyContent: "center",
    },
    scanningimg: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autowidth(30),
    },
    textinptoue: {
        paddingHorizontal: ScreenUtil.autowidth(5),
        marginBottom:  ScreenUtil.autoheight(10),
        borderBottomWidth: 1,
        borderBottomColor: UColor.mainColor,
        justifyContent: 'center',
    },
    inptitle: {
        flex: 1,
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fontColor,
    },

    textinpt: {
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(14),
        height: ScreenUtil.autoheight(40),
    },
    btnnextstep: {
        height:  ScreenUtil.autoheight(85),
        marginTop:  ScreenUtil.autoheight(30),
    },
    nextstep: {
        height:  ScreenUtil.autoheight(45),
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: ScreenUtil.autowidth(20),
        borderRadius: 5
    },
    nextsteptext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor
    },

    warningout: {
        marginVertical: ScreenUtil.autoheight(10),
        marginHorizontal:  ScreenUtil.autoheight(20),
        flexDirection: "row",
        alignItems: 'center', 
        paddingHorizontal: ScreenUtil.autowidth(10),
        paddingVertical:  ScreenUtil.autoheight(5),
        borderColor: UColor.showy,
        borderWidth: 1,
        borderRadius: 5,
    },

    warningoutShow: {
        marginHorizontal: ScreenUtil.autowidth(20),
        width: ScreenWidth-40,
        marginTop: ScreenUtil.autoheight(10),
        flexDirection: "row",
        alignItems: 'center', 
        paddingHorizontal: ScreenUtil.autowidth(10),
        paddingVertical:  ScreenUtil.autoheight(5),
        borderColor: UColor.showy,
        borderWidth: 1,
        borderRadius: 5,
    },

    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
    },
    headtitle: {
        flex: 1,
        color: UColor.showy,
        fontSize: ScreenUtil.setSpText(12),
        lineHeight:  ScreenUtil.autoheight(20),
        paddingLeft: ScreenUtil.autowidth(10),
    },
})
export default TurnOut;