import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,KeyboardAvoidingView,TouchableOpacity,TouchableHighlight} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyShowLD } from "../../components/EasyShow"
import { Eos } from "react-native-eosjs";
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import Assets from '../../models/Assets';
import EosUpdateAuth from '../../utils/EosUtil'
import Constants from '../../utils/Constants'
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class AuthAransfer extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.wallet.name,
            headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
        },
        headerRight: (<Button  onPress={navigation.state.params.onPress}>  
            <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>提交</Text>
        </Button>),    
        };
    }

    //提交
    submission = () =>{  

        if(this.state.isAuth==false){
            EasyToast.show("找不到对应的公钥");
            return
        }

        if(this.state.inputActivePK.length<1 && this.state.inputOwnerPK.length<1){
            EasyToast.show("请输入正确的公钥");
            return
        }

        var arrKeys=this.state.inputPubKey;
        var arrAccounts=this.state.inputAccounts;
        if(this.state.inputOwnerPK.length>0){
            Eos.checkPublicKey(this.state.inputOwnerPK, (r) => {
                if (!r.isSuccess) {
                    EasyToast.show('Owner公钥格式不正确');
                    return;
                }
            });
        }

        if(this.state.inputActivePK.length>0){
            Eos.checkPublicKey(this.state.inputActivePK, (r) => {
                if (!r.isSuccess) {
                    EasyToast.show('Active公钥格式不正确');
                    return;
                }
            });
        }

        for (var j = 0; j < arrKeys.length; j++) {
            if ((this.state.inputOwnerPK.length>0) && (arrKeys[j].key ==this.state.inputOwnerPK)) {
                EasyToast.show('Owner公钥已存在');
                return;
            }

            if ((this.state.inputActivePK.length>0) && (arrKeys[j].key ==this.state.inputActivePK)) {
                EasyToast.show('Active公钥已存在');
                return;
            }
        }

        arrKeys.push({weight:1,key:this.state.inputText[i].value})

        

        // this.changeAuth(arrKeys,arrAccounts);
       
    }  

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.props.navigation.setParams({ onPress: this.submission});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            // dataSource: ds.cloneWithRows(['row1', 'row2']),
            ownerPk:'',
            threshold:'1',//权阀值
            authKeys:[],//授权的公钥组
            isAuth:false,//当前的公钥是否在授权公钥的范围内

            inputPubKey:[],//输入公钥组
            inputAccounts:[],//输入账户组

            inputOwnerPK:'',
            inputActivePK:'',


        }
    }
    //组件加载完成
    componentDidMount() {
        this.setState({
            ownerPk:this.props.navigation.state.params.wallet.ownerPublic,
        });
        this.getAccountInfo();
    }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
 
  transferByOwner() {
    // Clipboard.setString(this.state.ownerPk);
    EasyToast.show("这个是跳转到过户")
  }

  manageByActive() {
    // Clipboard.setString(this.state.ownerPk);
    EasyToast.show("这个跳转到管理")
  }

  //获取账户信息
  getAccountInfo(){
    EasyShowLD.loadingShow();
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.navigation.state.params.wallet.name},callback: (data) => {
        EasyShowLD.loadingClose();
        var retAcc=data.permissions[0].required_auth.accounts;
        var retKeys=data.permissions[0].required_auth.keys;
        var temp=[];
        var authFlag=false;

        //账户
        for(var i=0;i<retAcc.length;i++){
            if(retAcc[i].permission.actor != this.props.navigation.state.params.wallet.name){
                temp.push({weight:retAcc[i].weight,key:retAcc[i].permission.actor+"@"+retAcc[i].permission.permission});
            }
        }

        //公钥
        for(var i=0;i<retKeys.length;i++){
            if(retKeys[i].key != this.props.navigation.state.params.wallet.activePublic){
                temp.push({weight:retKeys[i].weight,key:retKeys[i].key});
            }else{
                authFlag=true;
            }
        }

        this.setState({
            threshold:data.permissions[0].required_auth.threshold,
            isAuth:authFlag,
            authKeys:temp,//授权的公钥组
            inputPubKey:retKeys,//输入公钥组
            inputAccounts:retAcc,//输入账户组

        });
        console.log("getaccountinfo=%s",JSON.stringify(data))
    } });
} 

EosUpdateAuth = (account, pvk,Keys,Accounts, callback) => { 
    if (account == null) {
      if(callback) callback("无效账号");
      return;
    };

    console.log("Keys=%s",JSON.stringify(Keys))
    console.log("Accounts=%s",JSON.stringify(Accounts))

    Eos.transaction({
        actions: [
            {
                account: "eosio",
                name: "updateauth", 
                authorization: [{
                actor: account,
                permission: 'active'
                }], 
                data: {
                    account: account,
                    permission: 'active',
                    parent: "owner",
                    auth: {
                        threshold: 1,
                        keys: Keys,
                        accounts: Accounts,
                      }
                }
            }
        ]
    }, pvk, (r) => {
      if(callback) callback(r);
    });
  };


  changeAuth(arrKeys,arrAccounts){

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
        
        var privateKey = this.props.navigation.state.params.wallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.navigation.state.params.wallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                EasyShowLD.loadingShow();
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                this.EosUpdateAuth(this.props.navigation.state.params.wallet.name, plaintext_privateKey,arrKeys,arrAccounts, (r) => {
                        // alert(JSON.stringify(r));
                        console.log("r=%s",JSON.stringify(r))
                        EasyShowLD.loadingClose();
                        this.getAccountInfo();//成功后刷新一下
                    });
                EasyShowLD.loadingClose();
            } else {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyShowLD.loadingClose();
            EasyToast.show('密码错误');
        }

    }, () => { EasyShowLD.dialogClose() });
  }


  dismissKeyboardClick() {
    dismissKeyboard();
  }

  

  render() {

    return (<View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="always">

        {this.state.ownerPk != '' && 
        <View style={styles.inptoutgo} >
            <View style={styles.titleStyle}>
                <Text style={styles.inptitle}>Owner关联公钥（拥有者）</Text>
            </View>
            <View style={styles.titleStyle}>
                <Text style={styles.pktext}>{this.state.ownerPk}</Text>
            </View>
        </View>
        }

        <View style={styles.significantout}>
            <Image source={UImage.warning} style={styles.imgBtnWarning} />
            <View style={{flex: 1,paddingLeft: 5,}}>
                <Text style={styles.significanttext}>安全警告:</Text>
                <Text style={styles.significanttext}>Owner公钥与Active公钥可独立变更，它将更改账号拥有者权限。</Text>
                <Text style={styles.significanttext}>Owner与Active同时更改后原始私钥无法开启该账号！（请认真核对公钥无误后操作！）</Text>
            </View>
        </View>

       <View style={styles.addUserTitle} >
            <View style={styles.titleStyle}>
                <View style={styles.userAddView}>
                    <Image source={UImage.adminA} style={styles.imgBtn} />
                    <Text style={styles.buttonText}>过户操作</Text>
                </View>
            </View>

            <TextInput ref={(ref) => this._lowner = ref} value={this.state.inputOwnerPK} returnKeyType="next" editable={true}
                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                onChangeText={(inputOwnerPK) => this.setState({ inputOwnerPK: this.state.inputOwnerPK})}   keyboardType="default" 
                placeholder="粘贴或输入Owner公钥" underlineColorAndroid="transparent"  multiline={true}  />

            <TextInput ref={(ref) => this._lactive = ref} value={this.state.inputPubKey} returnKeyType="next" editable={true}
                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                onChangeText={(inputPubKey) => this.setState({ inputPubKey: this.state.inputPubKey})}   keyboardType="default" 
                placeholder="粘贴或输入Active公钥" underlineColorAndroid="transparent"  multiline={true}  />

        </View>

      </ScrollView>
    </View>);
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,
    },
    scrollView: {

    },
    header: {
        marginTop: 50,
        backgroundColor: UColor.secdColor,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,


    },
    inptoutgo: {
        marginTop: 10,
        marginBottom: 10,
        paddingBottom: 20,
        backgroundColor: UColor.mainColor,
        marginLeft:5,
        marginRight:5,
        borderRadius: 5,
        
    },
    //添加用户
    addUserTitle: {
        flex: 1,
        marginTop: 5,
        marginBottom: 10,
        paddingBottom: 5,
        backgroundColor: UColor.mainColor,
        // marginLeft:10,
        // marginRight:10,
        // borderRadius: 5,
        
    },

    titleStyle:{
        marginTop: 5,
        marginLeft:10,
        marginRight:10,
        flexDirection:'row',
        flex:1
    },
    inptitle: {
        // flex: 1,
        fontSize: 15,
        lineHeight: 30,
        color: UColor.fontColor,
    },

     //用户添加样式  
    userAddView: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

     // 按钮  
    buttonView: {
        flex: 1,
        flexDirection: "row",
        // paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 30,
        color:  UColor.fontColor,
    },

    // inptgo: {
    //     flex: 1,
    //     height: 60,
    //     paddingHorizontal: 10,
    //     backgroundColor: UColor.secdColor,
    // },
    inptext: {
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
    },
    textout: {
            paddingHorizontal: 16,
            paddingVertical: 10,
    },
    titletext: {
        fontSize: 15,
        color: UColor.fontColor,
        paddingVertical: 8,
    },
    explaintext: {
        fontSize: 13,
        color: UColor.fontColor,
        paddingLeft: 20,
        paddingVertical: 5,
        marginBottom: 10,
        lineHeight: 25,
    },
    imgBtn: {
        width: 25,
        height: 25,
        // lineHeight:30,
        marginTop: 0,
        marginBottom: 5,
        marginHorizontal:5,
      },

    pktext: {
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
    },
    weightText: {
        fontSize: 12,
        lineHeight: 30,
        color:  UColor.arrow,
    },

    //删除样式
    delText: {
        fontSize: 15,
        // lineHeight: 30,
        marginRight:10,
        color:  UColor.tintColor,
    },
    //删除按键样式
    delButton: {
        flex: 1,
        flexDirection: "row",
        // paddingHorizontal: 5,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    //警告样式
    significantout: {
        flexDirection: "row",
        alignItems: 'center', 
        marginHorizontal: 15,
        marginVertical: 5,
        padding: 5,
        backgroundColor: UColor.mainColor,
        borderColor: UColor.riseColor,
        borderWidth: 1,
        borderRadius: 5,
      },
      imgBtnWarning: {
        width: 30,
        height: 30,
        margin:5,
      },
      significanttext: {
        color: UColor.riseColor,
        fontSize: 13, 
      },
    
      //添加用户框
    addUser: {
        paddingBottom: 15,
        backgroundColor: UColor.mainColor,
    },

    ionicout: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inptgo: {
        flex: 1,
        height: 60,
        fontSize: 14,
        // lineHeight: 25,
        color: UColor.arrow,
        paddingHorizontal: 10,
        textAlignVertical: 'top',
        backgroundColor: UColor.secdColor,
        marginTop:10,
        marginBottom:10,
        marginLeft:15,
        marginRight:15,
        borderRadius: 5,
    },


    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: maxWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

});

export default AuthAransfer;
