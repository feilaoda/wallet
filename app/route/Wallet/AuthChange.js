import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,KeyboardAvoidingView,TouchableOpacity,TouchableHighlight,FlatList} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from "../../components/EasyShow"
import { Eos } from "react-native-eosjs";
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import Assets from '../../models/Assets';
import EosUpdateAuth from '../../utils/EosUtil'
import Constants from '../../utils/Constants'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class AuthChange extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.wallet.name,
            headerStyle: {
                paddingTop: ScreenUtil.autoheight(20),
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
        headerRight: (<Button  onPress={navigation.state.params.onPress}>  
            <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>提交</Text>
        </Button>),    
        };
    }


    verifyAccount(obj){
        var ret = true;
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        if(obj == "" || obj.length > 12){
            return false;
        }
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }

            if(j >= charmap.length){
                //非法字符
                // obj = obj.replace(tmp, ""); 
                ret = false;
                break;
            }
        }
        return ret;
      }

    //提交
    submission = () =>{  

        if(this.state.isAuth==false){
            EasyToast.show("找不到对应的公钥或账号");
            return
        }

        if(this.state.inputText.length<1){
            EasyToast.show("请先输入账号或者公钥");
            return
        }

        var authTempActive=this.state.activeAuth;

        for(var i=0;i<this.state.inputText.length;i++){
            if (this.state.inputText[i].value.length > 12) {
                Eos.checkPublicKey(this.state.inputText[i].value, (r) => {
                    if (!r.isSuccess) {
                        EasyToast.show('公钥格式不正确');
                        return;
                    }
                });

                for (var j = 0; j < authTempActive.data.auth.keys.length; j++) {
                    if (authTempActive.data.auth.keys[j].key ==this.state.inputText[i].value) {
                        EasyToast.show('添加公钥已存在');
                        return;
                    }
                }
                authTempActive.data.auth.keys.push({weight:1,key:this.state.inputText[i].value})
            }else if(this.state.inputText[i].value.length >= 1){
                if(this.verifyAccount(this.state.inputText[i].value)==false){
                    EasyToast.show('请输入正确的账号');
                    return 
                }

                for (var j = 0; j < authTempActive.data.auth.accounts.length; j++) {
                    if (authTempActive.data.auth.accounts[j].permission.actor ==this.state.inputText[i].value) {
                        EasyToast.show('添加账号已存在');
                        return;
                    }
                }
                // {"weight":1,"permission":{"actor":this.state.inputContent,"permission":"eosio.code"}}
                authTempActive.data.auth.accounts.push({"weight":1,"permission":{"actor":this.state.inputText[i].value,"permission":"active"}});
            }
        }

        this.changeAuth(authTempActive);
       
    }  

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.props.navigation.setParams({ onPress: this.submission});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            // dataSource: ds.cloneWithRows(['row1', 'row2']),
            activePk:'',
            threshold:'1',//权阀值
            authKeys:[],//授权的公钥组
            isAuth:false,//当前的公钥是否在授权公钥的范围内
            inputCount:0,
            inputText:[{key:0,value:''}],
            activeAuth:'',//更改的数据组

        }
    }
    //组件加载完成
    componentDidMount() {
        this.setState({
            activePk:this.props.navigation.state.params.wallet.activePublic,
        });
        this.getAccountInfo();
    }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
 
  //获取账户信息
  getAccountInfo(){
    EasyShowLD.loadingShow();
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.navigation.state.params.wallet.name},callback: (data) => {
        EasyShowLD.loadingClose();
        var temp=[];
        var authFlag=false;
        var authTempActive={
            account: "eosio",
            name: "updateauth", 
            authorization: [{
            actor: '',//操作者 account
            permission: 'active'// active
            }], 
            data: {
                account: '',//操作者 account
                permission: 'active',// active
                parent: "",// owner
                auth: {
                    threshold: '',//总阀值 1
                    keys: [],//公钥组 Keys
                    accounts: [],//帐户组 Accounts
                  }
            }
        };

        //active 
        authTempActive.authorization[0].actor=this.props.navigation.state.params.wallet.name;
        authTempActive.data.account=this.props.navigation.state.params.wallet.name;
        authTempActive.data.parent=data.permissions[0].parent;
        authTempActive.data.auth.threshold=data.permissions[0].required_auth.threshold;
        authTempActive.data.auth.keys=data.permissions[0].required_auth.keys;
        authTempActive.data.auth.accounts=data.permissions[0].required_auth.accounts;

        //账户
        for(var i=0;i<authTempActive.data.auth.accounts.length;i++){
            if(authTempActive.data.auth.accounts[i].permission.actor != this.props.navigation.state.params.wallet.name){
                temp.push({weight:authTempActive.data.auth.accounts[i].weight,key:authTempActive.data.auth.accounts[i].permission.actor+"@"+authTempActive.data.auth.accounts[i].permission.permission});
            }
        }

        //公钥
        for(var i=0;i<authTempActive.data.auth.keys.length;i++){
            if(authTempActive.data.auth.keys[i].key != this.props.navigation.state.params.wallet.activePublic){
                temp.push({weight:authTempActive.data.auth.keys[i].weight,key:authTempActive.data.auth.keys[i].key});
            }else{
                authFlag=true;
            }
        }

        this.setState({
            threshold:data.permissions[0].required_auth.threshold,
            isAuth:authFlag,
            authKeys:temp,//授权的公钥组
            activeAuth:authTempActive,
            inputCount:0,
            inputText:[{key:0,value:''}],
        });
        console.log("getaccountinfo=%s",JSON.stringify(data))
    } });
} 

EosUpdateAuth = (account, pvk,authActiveArr, callback) => { 
    if (account == null) {
      if(callback) callback("无效账号");
      return;
    };

    console.log("authActiveArr=%s",JSON.stringify(authActiveArr))

    Eos.transaction({
        actions: [
            authActiveArr,
        ]
    }, pvk, (r) => {
      if(callback) callback(r);
    });
  };


  changeAuth(authTempActive){

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
                this.EosUpdateAuth(this.props.navigation.state.params.wallet.name, plaintext_privateKey,authTempActive,(r) => {
                    EasyShowLD.loadingClose();
                        // alert(JSON.stringify(r));
                        // console.log("r=%s",JSON.stringify(r))
                        if(r.isSuccess==true){
                            EasyToast.show('授权变更成功！');
                            this.getAccountInfo();//成功后刷新一下
                        }else{
                            EasyToast.show('授权变更失败！');
                        }
    
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

  //这个是用来删除当前行的
  deleteUser = (delKey) =>{  

    if(delKey.indexOf("@")!=-1){
        delKey = delKey.replace( /([^@]+)$/, "");  //删除@后面的字符
        delKey = delKey.replace( "@", "");  //删除@后面的字符
    }

    if(this.state.isAuth==false){
        EasyToast.show("找不到对应的公钥或账号");
        return
    }

    var authTempActive=this.state.activeAuth;

    
    if(delKey.length>12){
        for (var i = 0; i < authTempActive.data.auth.keys.length; i++) {
            if (authTempActive.data.auth.keys[i].key ==delKey) {
                authTempActive.data.auth.keys.splice(i, 1);
            }
        }
    }else{
        for (var i = 0; i < authTempActive.data.auth.accounts.length; i++) {
            if (authTempActive.data.auth.accounts[i].permission.actor ==delKey) {
                authTempActive.data.auth.accounts.splice(i, 1);
            }
        }
    }
// arrAccounts.push({"weight":1,"permission":{"actor":this.state.inputContent}});
    this.changeAuth(authTempActive);
   
}  


  _renderRow(rowData){ // cell样式

    // console.log("_renderRow rowData=%s",JSON.stringify(rowData))

    return (

        <View style={styles.addUserTitle}>
            
            <View style={styles.titleStyle}>
                <View style={styles.userAddView}>
                    <Image source={UImage.adminAddA} style={styles.imgBtn} />
                    <Text style={styles.buttonText}>已添加用户</Text>
                </View>

                <View style={styles.buttonView}>
                    <Text style={styles.weightText}>权阀值  </Text>
                    <Text style={styles.buttonText}>{rowData.item.weight}</Text>
                </View>
            </View>

            <View style={styles.titleStyle}>
                <Text style={styles.pktext}>{rowData.item.key}</Text>
            </View>

            <TouchableHighlight onPress={() => { this.deleteUser(rowData.item.key) }} style={{flex: 1,}} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                <View style={styles.delButton}>
                    <Text style={styles.delText}>删除</Text>
                </View>
            </TouchableHighlight>

       </View>
    )
  }



//添加更多
addMoreUser() {

    var txt=this.state.inputText;
    var cnt = this.state.inputCount;

    if(txt.length){
        cnt=txt.length;//从0开始数的
    }else{
        cnt=0;
    }
    txt.push({key:cnt,value:''});
    this.setState({
        inputCount: cnt, //输入账户组
        inputText:txt,
    });
}
    

//输入值
inputValue(inputKey,inputData){
    this.state.inputText[inputKey].key=inputKey;
    this.state.inputText[inputKey].value=inputData;
    return this.state.inputText;
}

//删除输入框
delInputBox(delKey){
    var txt=this.state.inputText;
    if(delKey<=this.state.inputCount){
        for (var i = 0; i < txt.length; i++) {
            if (txt[i].key ==delKey) {
                txt.splice(i, 1);
            }
        }
        for (var i = 0; i < txt.length; i++) {
            txt[i].key = i;
           
        }

        this.setState({
            inputText:txt,
            inputCount:txt.length
        });
    }

}

  _renderRowInput(rowData){ // cell样式
    // console.log("sectionID=%s",sectionID)
    // console.log("rowData=%s",JSON.stringify(rowData))

    rowID=rowData.index;
    return (
        
        <View style={styles.addUserTitle} >
            <View style={styles.titleStyle}>
                <View style={styles.userAddView}>
                    <Image source={UImage.adminAddA} style={styles.imgBtn} />
                    <Text style={styles.buttonText}>添加授权用户</Text>
                    <Text style={styles.buttonText}>{rowID}</Text>
                </View>

                <View style={styles.buttonView}>
                    <Text style={styles.weightText}>权阀值  </Text>
                    <Text style={styles.buttonText}>1</Text>
                </View>
            </View>

            <TextInput ref={(ref) => this._lphone = ref} value={rowData.item.value} returnKeyType="next" editable={true}
                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                onChangeText={(inputText) => this.setState({ inputText: this.inputValue(rowID,inputText)})}   keyboardType="default" 
                placeholder="输入账号或Active公钥" underlineColorAndroid="transparent"  multiline={true}  />

            {/* {rowData.key<this.state.inputCount && */}
            {/* {rowData.key>0 && */}
            {this.state.inputText.length>1 &&
            <TouchableHighlight onPress={() => { this.delInputBox(rowID) }} style={{flex: 1,}} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                <View style={styles.delButton}>
                    <Text style={styles.delText}>删除</Text>
                </View>
            </TouchableHighlight>}

        </View>
    )
  }



  render() {

    return (<View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="always">
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "padding" : null}>
        {this.state.activePk != '' && 
        <View style={styles.inptoutgo} >
            <View style={styles.titleStyle}>
                <Text style={styles.inptitle}>Active关联公钥（权阀总值:</Text>
                <Text style={styles.inptitle}>{this.state.threshold}</Text>
                <Text style={styles.inptitle}>）</Text>
                <View style={styles.buttonView}>
                    <Text style={styles.weightText}>权阀值  </Text>
                    <Text style={styles.buttonText}>{this.state.threshold}</Text>
                </View>
            </View>
            <View style={styles.titleStyle}>
                <Text style={styles.pktext}>{this.state.activePk}</Text>
            </View>
        </View>
        }

        <View style={styles.significantout}>
            <Image source={UImage.warning} style={styles.imgBtnWarning} />
            <View style={{flex: 1,paddingLeft: 5,}}>
                <Text style={styles.significanttext} >安全警告:Active公钥添加关联用户，他们可对您的账号进行转账，投票等操作！</Text>
            </View>
        </View>

        <FlatList
            data={this.state.authKeys.length==null ?[]: this.state.authKeys} 
            extraData={this.state}
            renderItem={this._renderRow.bind(this)} >
        </FlatList>

        <FlatList
            data={this.state.inputText.length==null ?[]: this.state.inputText} 
            extraData={this.state}
            renderItem={this._renderRowInput.bind(this)} >
        </FlatList>



        <TouchableHighlight onPress={() => { this.addMoreUser(this) }} style={{flex: 1,}} activeOpacity={0.5} underlayColor={UColor.mainColor}>
            <View style={styles.delButton}>
                <Text style={styles.delText}>添加更多</Text>
            </View>
        </TouchableHighlight>
</KeyboardAvoidingView>
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
        fontSize: 15, 
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
        width: ScreenWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

});

export default AuthChange;
