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

const OWNER_MODE=0;
const ACTIVE_MODE=1;


@connect(({wallet, vote}) => ({...wallet, ...vote}))
class AuthTransfer extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            // headerTitle: params.wallet.name,
            headerTitle: "Owner权限管理",
            headerStyle: {
                paddingTop: ScreenUtil.autoheight(10),
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
            headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ paddingHorizontal: ScreenUtil.autowidth(10), alignItems: 'center' }}>
                <Image source={UImage.scan} style={{ width: ScreenUtil.autowidth(28), height: ScreenUtil.autowidth(28) }}></Image>
            </View>
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

        if(this.state.inputText==''){
            EasyToast.show("输入不能为空");
            return//暂不支持账号先
        }

        var authTemp='';
        var authKeys=[];

        if(this.state.index==OWNER_MODE){
            authKeys=this.state.authOwnerKeys;
            authTemp=this.state.ownerAuth;
        }else if(this.state.index==ACTIVE_MODE){
            authKeys=this.state.authActiveKeys;
            authTemp=this.state.activeAuth;
        }else{
            return
        }
        
        for (var j = 0; j < authKeys.length; j++) {
            if (authKeys[j].key ==this.state.inputText) {
                EasyToast.show('添加授权公钥已存在');
                return;
            }
        }

        if (this.state.inputText.length > 12) {
            Eos.checkPublicKey(this.state.inputText, (r) => {
                if (!r.isSuccess) {
                    EasyToast.show('您输入的公钥有误，请核对后再试！');
                    return;
                }else{
                    authTemp.data.auth.keys.push({weight:1,key:this.state.inputText})
                    this.changeAuth(authTemp);
                }
            });
        }else{
            EasyToast.show('输入数据长度不正确');
        }

    }  

    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        // this.props.navigation.setParams({ onPress: this.submission});
        this.props.navigation.setParams({ onPress: this._rightTopClick });
        this.state = {
            dataSource: ds.cloneWithRows([]),
            index: OWNER_MODE,//默认为OWNER
            routes: [
                { key: '0', title: 'Owner'},
                { key: '1', title: 'Active'},
              ],
            // dataSource: ds.cloneWithRows(['row1', 'row2']),
            activePk:'',
            ownerPk:'',
            threshold:'1',//权阀值
            authActiveKeys:[],//授权的公钥组
            authOwnerKeys:[],//授权的公钥组
            isAuth:false,//当前的公钥是否在授权公钥的范围内
            inputCount:0,
            inputText:'',
            activeAuth:'',//更改的数据组
            ownerAuth:'',//更改的数据组

        }
    }

    _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.name});
      }
    //组件加载完成
    componentDidMount() {
        this.setState({
            ownerPk:this.props.navigation.state.params.wallet.ownerPublic,
            activePk:this.props.navigation.state.params.wallet.activePublic,
        });
        this.getAuthInfo();
        DeviceEventEmitter.addListener('scan_result', (data) => {
            this.setState({inputText:data.toaccount})
        });

    }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
 
  //获取账户信息
  getAuthInfo(){
    EasyShowLD.loadingShow();
    this.props.dispatch({ type: 'vote/getAuthInfo', payload: { page:1,username: this.props.navigation.state.params.wallet.name},callback: (resp) => {
        EasyShowLD.loadingClose();
        
        if(resp && resp.code == '0'){
            var authFlag=false;
            var tempActive=[];
            var authTempActive={
                account: "eosio",
                name: "updateauth", 
                authorization: [{
                actor: '',//操作者 account
                permission: 'owner'// active
                }], 
                data: {
                    account: '',//操作者 account
                    permission: 'active',// active
                    parent: "owner",// owner
                    auth: {
                        threshold: '',//总阀值 1
                        keys: [],//公钥组 Keys
                        accounts: [],//帐户组 Accounts
                      }
                }
            };
            var tempOwner=[];
            var authTempOwner={
                account: "eosio",
                name: "updateauth", 
                authorization: [{
                actor: '',//操作者 account
                permission: 'owner'// owner
                }], 
                data: {
                    account: '',//操作者 account
                    permission: 'owner',// owner
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
            authTempActive.data.parent=resp.data.permissions[0].parent;
            authTempActive.data.auth.threshold=resp.data.permissions[0].required_auth.threshold;
            authTempActive.data.auth.keys=resp.data.permissions[0].required_auth.keys;
            authTempActive.data.auth.accounts=resp.data.permissions[0].required_auth.accounts;
            //账户（显示）
            for(var i=0;i<authTempActive.data.auth.accounts.length;i++){
                tempActive.push({weight:authTempActive.data.auth.accounts[i].weight,key:authTempActive.data.auth.accounts[i].permission.actor+"@"+authTempActive.data.auth.accounts[i].permission.permission});
            }
            //公钥
            for(var i=0;i<authTempActive.data.auth.keys.length;i++){
                tempActive.push({weight:authTempActive.data.auth.keys[i].weight,key:authTempActive.data.auth.keys[i].key});
            }
    
            //owner 
            authTempOwner.authorization[0].actor=this.props.navigation.state.params.wallet.name;
            authTempOwner.data.account=this.props.navigation.state.params.wallet.name;
            authTempOwner.data.parent=resp.data.permissions[1].parent;
            authTempOwner.data.auth.threshold=resp.data.permissions[1].required_auth.threshold;
            authTempOwner.data.auth.keys=resp.data.permissions[1].required_auth.keys;
            authTempOwner.data.auth.accounts=resp.data.permissions[1].required_auth.accounts;
    
            //账户（显示）
            for(var i=0;i<authTempOwner.data.auth.accounts.length;i++){
                tempOwner.push({weight:authTempOwner.data.auth.accounts[i].weight,key:authTempOwner.data.auth.accounts[i].permission.actor+"@"+authTempOwner.data.auth.accounts[i].permission.permission});
            }
    
            //公钥
            for(var i=0;i<authTempOwner.data.auth.keys.length;i++){
                tempOwner.push({weight:authTempOwner.data.auth.keys[i].weight,key:authTempOwner.data.auth.keys[i].key});
            }
    
            authFlag=true;//获取账户成功后可以
            this.setState({
                threshold:resp.data.permissions[0].required_auth.threshold,
                isAuth:authFlag,
                authActiveKeys:tempActive,//授权的公钥组
                authOwnerKeys:tempOwner,//授权的公钥组
                activeAuth:authTempActive,
                ownerAuth:authTempOwner,
                inputCount:0,
                inputText:'',
            });
        }else{
            this.setState({isAuth: false});
        }

    } });
} 

EosUpdateAuth = (account, pvk,authArr, callback) => { 
    if (account == null) {
      if(callback) callback("无效账号");
      return;
    };

    console.log("authArr=%s",JSON.stringify(authArr))

    Eos.transaction({
        actions: [
            authArr,
        ]
    }, pvk, (r) => {
      if(callback) callback(r);
    });
  };


  changeAuth(authTemp){

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
        
        // var privateKey = this.props.navigation.state.params.wallet.activePrivate;
        var privateKey = this.props.navigation.state.params.wallet.ownerPrivate;
        try {
            EasyShowLD.loadingShow();
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.navigation.state.params.wallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                this.EosUpdateAuth(this.props.navigation.state.params.wallet.name, plaintext_privateKey,authTemp,(r) => {
                    EasyShowLD.loadingClose();
                        // alert(JSON.stringify(r));
                        console.log("r=%s",JSON.stringify(r))
                        if(r.isSuccess==true){
                            EasyToast.show('授权变更成功！');
                        }else{
                            EasyToast.show('授权变更失败！');
                        }
                        this.getAuthInfo();//刷新一下
                    });
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



  //获得typeid坐标
  getRouteIndex(typeId){
    //   return 0;
    for(let i=0;i<this.state.routes.length;i++){
        if(this.state.routes[i].key==typeId){
            return i;
        }
    }
  }

//切换tab
_handleIndexChange = index => {
    // console.log("index=%s",index);
    if(this.state.index!=index){
        this.setState({
            index:index,
            inputText:'',
        });
    }
};
    
  _handleTabItemPress = ({ route }) => {
    // console.log("route=%s",JSON.stringify(route));
    const indexn = this.getRouteIndex(route.key);
    if(this.state.index!=indexn){
        this.setState({
            index:indexn,
            inputText:'',
        });
    }
  }


  //这个是用来删除当前行的
  deleteUser = (delKey) =>{  

    if(delKey.indexOf("@")!=-1){
        delKey = delKey.replace( /([^@]+)$/, "");  //删除@后面的字符
        delKey = delKey.replace( "@", "");  //删除@后面的字符
    }

    if(this.state.isAuth==false){
        // EasyToast.show("找不到对应的公钥或账号");
        EasyToast.show("网络繁忙，请刷新再重试");
        return
    }

    var authTemp='';

    if(this.state.index==OWNER_MODE){
        authTemp=this.state.ownerAuth;
    }else if(this.state.index==ACTIVE_MODE){
        authTemp=this.state.activeAuth;
    }else{
        return
    }

    if(delKey.length>12){
        for (var i = 0; i < authTemp.data.auth.keys.length; i++) {
            if (authTemp.data.auth.keys[i].key ==delKey) {
                authTemp.data.auth.keys.splice(i, 1);
            }
        }
    }else{
        for (var i = 0; i < authTemp.data.auth.accounts.length; i++) {
            if (authTemp.data.auth.accounts[i].permission.actor ==delKey) {
                authTemp.data.auth.accounts.splice(i, 1);
            }
        }
    }
    this.changeAuth(authTemp);
   
}  


  _renderRow(rowData){ // cell样式

    // console.log("_renderRow rowData=%s",JSON.stringify(rowData))

    return (

        <View style={styles.addUserTitle}>
            
            <View style={styles.titleStyle}>
                <View style={styles.userAddView}>
                    {/* <Image source={UImage.adminAddA} style={styles.imgBtn} /> */}
                    {((this.state.index==OWNER_MODE?this.state.authOwnerKeys[0].key:this.state.authActiveKeys[0].key) == rowData.item.key) &&
                        <Text style={styles.authText}>{this.state.index==OWNER_MODE?"管理者用户(Owner)":"管理者用户(Active)"}</Text>
                    }
                </View>

                <View style={styles.buttonView}>
                    <Text style={styles.weightText}>权重  </Text>
                    <Text style={styles.buttonText}>{rowData.item.weight}</Text>
                </View>
            </View>
            

            <View style={{flex:1,flexDirection: "row",}}>
                <View style={styles.showPkStyle}>
                    <Text style={styles.pktext}>{rowData.item.key}</Text>
                </View>
                {/* {(this.state.activeAuth.data.auth.keys.length>1 || rowData.item.key.length<50) && */}
                <TouchableHighlight onPress={() => { this.deleteUser(rowData.item.key) }}  >
                    <View style={styles.delButton}>
                        <Image source={UImage.delicon} style={styles.imgBtn} />
                    </View>
                </TouchableHighlight>
                {/* } */}
            </View>

       </View>
    )
  }



  renderScene = ({route}) => {
    if(route.key==''){
      return (<View></View>)
    }
    return (
        <View style={{flex:1,}}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null} style={styles.tab}>
            <ScrollView keyboardShouldPersistTaps="always" >
            <FlatList
                data={this.state.index==OWNER_MODE?(this.state.authOwnerKeys.length==null ?[]: this.state.authOwnerKeys):(this.state.authActiveKeys.length==null ?[]: this.state.authActiveKeys) }
                extraData={this.state}
                renderItem={this._renderRow.bind(this)} >
            </FlatList>

            <View style={styles.addUserTitle}>
                <View style={styles.titleStyle}>
                    <View style={styles.buttonView}>
                        <Text style={styles.weightText}>权重  </Text>
                        <Text style={styles.buttonText}>1</Text>
                    </View>
                </View>

                <View style={{flex:1,flexDirection: "row",}}>
                    <TextInput ref={(ref) => this._lphone = ref} value={this.state.inputText} returnKeyType="next" editable={true}
                        selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                        onChangeText={(inputText) => this.setState({ inputText: inputText})}   keyboardType="default" 
                        placeholder={this.state.index==OWNER_MODE?"请您输入Owner公钥":"请您输入Active公钥 "} underlineColorAndroid="transparent"  multiline={true}  />

                    <View style={styles.addButton}>
                        <Image source={UImage.adminAddA} style={styles.imgBtn} />
                    </View>
                </View>
            </View>

            <Button onPress={ this.submission.bind(this) }>
                <View style={styles.btnoutsource}>
                    <Text style={styles.btntext}>授权</Text>
                </View>
            </Button>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
    );
  }




  
  render() {

    return (
    <View style={styles.container}>
    
        <View style={styles.significantout}>
            <Image source={UImage.warning} style={styles.imgBtnWarning} />
            <View style={{flex: 1,padding: 5,}}>
                <Text style={styles.significanttext} >安全警告</Text>
                <Text style={styles.significanttext} >请确保您清楚了解owner授权,并确保添加的授权用户是您信任的用户，添加的授权用户将获得账号的全部权限（包括变更权限和转账投票）。</Text>
            </View>
        </View>

        <TabViewAnimated
        lazy={true}
        style={styles.containertab}
        navigationState={this.state}
        renderScene={this.renderScene.bind(this)}
        renderHeader={(props)=><TabBar onTabPress={this._handleTabItemPress} 
        labelStyle={{fontSize:ScreenUtil.setSpText(15),margin:0,marginBottom:10,paddingTop:10,color:UColor.lightgray}} 
        indicatorStyle={{backgroundColor:UColor.tintColor,width:93,marginLeft:0,}} 
        style={{backgroundColor:UColor.secdColor,}} 
        tabStyle={{width:100,padding:0,margin:0,}} 
        scrollEnabled={true} {...props}/>}
        onIndexChange={this._handleIndexChange}
        initialLayout={{height:0,width:ScreenWidth}}
        />

    </View>);
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,
    },

    containertab: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
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
        paddingBottom: 5,
        backgroundColor: UColor.mainColor,
        marginLeft:5,
        marginRight:5,
        borderRadius: 5,
        
    },
    //添加用户
    addUserTitle: {
        flex: 1,
        marginTop: 1,
        paddingBottom: 10,
        backgroundColor: UColor.mainColor,
    },

    titleStyle:{
        flex:1,
        marginTop: 5,
        marginBottom: 1,
        marginLeft:11,
        marginRight:42,
        flexDirection:'row',
    },

    showPkStyle: {
        flex: 1,
        // fontSize: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
        // textAlignVertical: 'top',
        marginLeft:15,
        marginRight:5,
        borderColor: UColor.arrow,
        borderWidth: 1,
        borderRadius: 5,
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
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    buttonText: {
        fontSize: 12,
        // lineHeight: 30,
        color:  UColor.fontColor,
    },
    authText: {
        fontSize: 12,
        lineHeight: 30,
        color:  UColor.fontColor,
    },


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
        width: 23,
        height: 24,
        // lineHeight:30,
        // marginTop: 0,
        // marginBottom: 5,
        // marginHorizontal:5,
      },

    pktext: {
        fontSize: 14,
        // lineHeight: 25,
        color: UColor.arrow,
    },
    weightText: {
        fontSize: 12,
        // lineHeight: 30,
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
        paddingHorizontal: 5,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    //删除按键样式
    addButton: {
        // flex: 1,
        flexDirection: "row",
        paddingHorizontal: 5,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    //警告样式
    significantout: {
        flexDirection: "row",
        alignItems: 'center', 
        marginHorizontal: 15,
        marginVertical: 10,
        padding: 5,
        backgroundColor: UColor.secdColor,
        borderColor: UColor.riseColor,
        borderWidth: 1,
        borderRadius: 5,
      },
      imgBtnWarning: {
        width: 23,
        height: 20,
        margin:5,
      },
      significanttext: {
        color: UColor.warningRed,
        fontSize: 13, 
        lineHeight:17,
        // letterSpacing:1, //字符间距
        // fontWeight: 'bold',//加粗
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
        
        height: 57,
        fontSize: 15,
        // lineHeight: 25,
        color: UColor.arrow,
        paddingHorizontal: 10,
        paddingVertical: 10,
        textAlignVertical: 'top',
        backgroundColor: UColor.secdColor,
        marginLeft:15,
        marginRight:5,
        borderColor: UColor.arrow,
        borderWidth: 1,
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
    // 按钮  
    btnoutsource: {
        marginTop:15,
        marginHorizontal: ScreenUtil.autowidth(137),
        // width:ScreenUtil.autowidth(101),
        // height:ScreenUtil.autoheight(41),
        width:101,
        height:41,
        borderRadius: 5,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btntext: {
        fontSize: ScreenUtil.setSpText(17),
        color: UColor.fontColor
    },

    tab: {
        flex: 1,
    }
   
});

export default AuthTransfer;
