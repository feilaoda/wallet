import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, Image, View, Text, TextInput, Dimensions, TouchableOpacity, } from 'react-native';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
import {NavigationActions} from 'react-navigation';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, login}) => ({...wallet, ...login}))
class BackupsAOkey extends BaseComponent {
      static navigationOptions = ({ navigation }) => {
       
        return {                       
          headerTitle:'备份私钥',
          headerStyle:{
                paddingTop: ScreenUtil.autoheight(20),
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
          },
          headerRight: (<Button  onPress={navigation.state.params.onPress}>  
                <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>跳过</Text>
          </Button>),                  
        };
      };

      _rightTopClick = () =>{
        var entry = this.props.navigation.state.params.entry;
        if(entry == "createWallet"){
            this.pop(2, true);
            return;
        }
        this.pop(3, true);
        // const { navigate } = this.props.navigation;
        // navigate('WalletManage', {});
      }

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
        password: "",
        ownerPk: '',
        activePk: '',
        txt_owner: '',
        txt_active: '',
        PromptOwner: '',
        PromptActtve: '',
        show: false,
    };
  }

  //组件加载完成
  componentDidMount() {
    var ownerPrivateKey = this.props.navigation.state.params.wallet.ownerPrivate;
    var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
    var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
    var activePrivateKey = this.props.navigation.state.params.wallet.activePrivate;
    var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
    var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
    if (plaintext_words_owner.indexOf('eostoken') != - 1) {
        this.setState({
            txt_owner: plaintext_words_owner.substr(8, plaintext_words_owner.length),
            txt_active: plaintext_words_active.substr(8, plaintext_words_active.length),
        })
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  goToPayForActive(params){
    const { navigate } = this.props.navigation;
    navigate('ActivationAt', params);
  }

  activeWalletOnServer(){
    const { navigate } = this.props.navigation;
    let entry = this.props.navigation.state.params.entry;
    var wallet = this.props.navigation.state.params.wallet;
    let name = wallet.account;
    let owner = wallet.ownerPublic;
    let active = wallet.activePublic;

    try {
    EasyShowLD.loadingShow('正在请求');
    //检测账号是否已经激活
    this.props.dispatch({
        type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, callback:(result) =>{
            if(result.code == 0 && result.data == true){
                EasyShowLD.loadingClose();
                wallet.isactived = true
                this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                //msg:success,data:true, code:0 账号已存在
                EasyShowLD.dialogShow("恭喜激活成功", (<View>
                    <Text style={styles.passoutsource}>{name}</Text>
                    {/* <Text style={styles.inptpasstext}>您申请的账号已经被***激活成功</Text> */}
                </View>), "知道了", null,  () => {EasyShowLD.dialogClose(), this.pop(3, true) });
            }else {
                EasyShowLD.loadingClose();
                this.goToPayForActive({parameter:wallet, entry: entry});
            // this.props.dispatch({
            //     type: "login/fetchPoint", payload: { uid: Constants.uid }, callback:(data) =>{
            //       if (data.code == 403) {
            //         this.props.dispatch({
            //           type: 'login/logout', payload: {}, callback: () => {}
            //         });      
            //         EasyShowLD.loadingClose();
            //         this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //         return false;   
            //       }else if(data.code == 0){
            //         this.props.dispatch({
            //           type: 'wallet/createAccountService', payload: { username:name, owner: owner, active: active, isact:true}, callback: (data) => {
            //             EasyShowLD.loadingClose();
            //             if (data.code == '0') {
            //               wallet.isactived = true
            //               this.props.dispatch({
            //                 type: 'wallet/activeWallet', wallet: wallet, callback: (data, error) => {
            //                   DeviceEventEmitter.emit('updateDefaultWallet');
            //                   if (error != null) {
            //                     this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //                     return false;
            //                   } else {
            //                     EasyToast.show('激活账号成功');
            //                     return true;
            //                   }
            //                 }
            //               });
            //             }else{
            //               EasyShowLD.loadingClose();
            //               this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //               return false;
            //             }
            //           }
            //         });
            //       }else{
            //         EasyShowLD.loadingClose();
            //         this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //         return false;   
            //       }
            //     }
            //   });
            }
        }
    });
    } catch (error) {
      EasyShowLD.loadingClose();
      this.goToPayForActive({parameter:wallet, entry: entry})
      return false;
    }
  
  }

  pop(nPage, immediate) {
    const action = NavigationActions.pop({
        n: nPage,
        immediate: immediate,
    });
    this.props.navigation.dispatch(action);

  }

  backupOK(){
    const { navigate } = this.props.navigation;
    // 将钱包备份状态修改为已备份
    var wallet = this.props.navigation.state.params.wallet;
    wallet.isBackups = true;
    this.props.dispatch({type: 'wallet/updateWallet', wallet: wallet, callback: () => {
        // 跳转至下一步
        if(wallet.isactived){
            // 已经激活，这时钱包为已激活已备份状态，则跳回至钱包管理页面
            this.pop(3, true);
            EasyToast.show('备份成功');
        }else{
            // 未激活，这时钱包为已备份未激活状态，则开始激活账号流程
            this.activeWalletOnServer();
        }
    }});
  }

  backupConfirm() {
    if(this.state.txt_owner == ""){ // 由于导入私钥只导入active, 可能这里备份没有active私钥
        if(this.state.activePk == ""){
            EasyToast.show('请输入active私钥');
            return;
        }
        if(this.state.activePk != this.state.txt_active){
            this.setState({PromptActtve: '该私钥内容有误'})
            return;
        }

        if(this.state.activePk == this.state.txt_active ){
            this.backupOK();
            return;
        }
    }else{
        if (this.state.activePk == "") {
            EasyToast.show('请输入active私钥');
            return;
        }
        if (this.state.ownerPk == "") {
            EasyToast.show('请输入owner私钥');
            return;
        }
        if(this.state.activePk != this.state.txt_active){
            this.setState({PromptActtve: '该私钥内容有误'})
            return;
        }
        if(this.state.ownerPk != this.state.txt_owner){
            this.setState({PromptOwner: '该私钥内容有误'})
            return;
        }

        if(this.state.activePk == this.state.txt_active && this.state.ownerPk == this.state.txt_owner){
            this.backupOK();
            return;
        }
    }

    // const { navigate } = this.props.navigation;
    // navigate('ActivationAt', {});
  }

  intensity() {
    if (this.state.activePk == ""){
        this.state.PromptActtve = ''
    }
    if(this.state.ownerPk == ""){
        this.state.PromptOwner = ''
    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

    render() {
        return (<View style={styles.container}>         
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.scrollView}>
                <View style={styles.header}>
                    <View style={styles.inptoutbg}>
                        <View style={styles.headout}>
                            <Text style={styles.inptitle}>确认您的钱包私钥</Text>
                            <Text style={styles.headtitle}>请填入您所抄写的私钥，确保您填入无误后，按下一步。</Text>
                        </View>  
                        {this.state.txt_active != ''&& 
                        <View style={styles.inptoutgo} >
                            <View style={styles.ionicout}>
                                <Text style={styles.inptitle}>Active私钥</Text>
                                <Text style={styles.prompttext}>{this.state.PromptActtve}</Text>
                            </View>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.activePk} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                                onChangeText={(activePk) => this.setState({ activePk })}   keyboardType="default" onChange={this.intensity()} 
                                placeholder="输入active私钥" underlineColorAndroid="transparent"  multiline={true}  />
                        </View>
                        }
                         {this.state.txt_owner  != ''&&
                        <View style={styles.inptoutgo} >
                            <View style={styles.ionicout}>
                                <Text style={styles.inptitle}>Owner私钥</Text>
                                <Text style={styles.prompttext}>{this.state.PromptOwner}</Text>
                            </View>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.ownerPk} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                                onChangeText={(ownerPk) => this.setState({ ownerPk })}   keyboardType="default" onChange={this.intensity()} 
                                placeholder="输入owner私钥" underlineColorAndroid="transparent"  multiline={true}  />
                        </View>}
                    </View>
                    <Button onPress={() => this.backupConfirm()}>
                        <View style={styles.importPriout}>
                            <Text style={styles.importPritext}>下一步</Text>
                        </View>
                    </Button>
                    <View style={styles.logout}>
                        <Image source={UImage.bottom_log} style={styles.logimg}/>
                        <Text style={styles.logtext}>EosToken 专注柚子生态</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>)
    }
}
const styles = StyleSheet.create({
    passoutsource: {
        fontSize: 20, 
        color: UColor.showy, 
        textAlign: 'center',
    },
    inptpass: {
        color: UColor.tintColor,
        height: ScreenUtil.autoheight(45),
        width: ScreenWidth -100,
        paddingBottom: ScreenUtil.autoheight(5),
        fontSize: ScreenUtil.setSpText(16),
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flex: 1,
        marginTop: ScreenUtil.autoheight(10),
        backgroundColor: UColor.secdColor,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    headout: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(15),
    },
    headtitle: {
        color: UColor.arrow,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
    },
    inptoutgo: {
        width: ScreenWidth - ScreenUtil.autowidth(40),
        paddingBottom: ScreenUtil.autoheight(15),
        backgroundColor: UColor.mainColor,
    },
    ionicout: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inptitle: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
        color: UColor.fontColor,
    },
    prompttext: {
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(30),
        textAlign: 'right',
        color: UColor.showy,
    },
    inptgo: {
        flexWrap: 'wrap',
        color: UColor.arrow,
        textAlignVertical: 'top',
        backgroundColor: UColor.secdColor,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
        height: ScreenUtil.autoheight(60),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },

    importPriout: {
        height: ScreenUtil.autoheight(45),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: ScreenUtil.autowidth(20),
        marginTop: ScreenUtil.autoheight(50),
        borderRadius: 5,
        backgroundColor:  UColor.tintColor,
    },
    importPritext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor,
    },

    logout:{
        flex: 1,
        minHeight: ScreenUtil.autoheight(200),
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
export default BackupsAOkey;