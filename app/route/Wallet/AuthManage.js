import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,KeyboardAvoidingView,TouchableOpacity,TouchableHighlight} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import { EasyShowLD } from "../../components/EasyShow"
import Ionicons from 'react-native-vector-icons/Ionicons'

var dismissKeyboard = require('dismissKeyboard');
@connect(({wallet, vote}) => ({...wallet, ...vote}))
class AuthManage extends BaseComponent {

  static navigationOptions = {
    headerTitle: '权限管理',
    headerStyle: {
        paddingTop: ScreenUtil.autoheight(20),
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
        ownerPk: '',
        activePk: '',
        ownerThreshold:'1',//owner权阀值
        activeThreshold:'1',//active权阀值
      }
  }
    //组件加载完成
    componentDidMount() {
        this.setState({
            ownerPk: this.props.navigation.state.params.wallet.ownerPublic,//ownerPublic
            activePk: this.props.navigation.state.params.wallet.activePublic,
        })
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
            var temActiveKey='';
            var temOwnerKey='';

            var authTempOwner=data.permissions[1].required_auth.keys
            var authTempActive=data.permissions[0].required_auth.keys
            //公钥
            for(var i=0;i<authTempOwner.length;i++){
                if((authTempOwner[i].key == this.props.navigation.state.params.wallet.activePublic)||(authTempOwner[i].key == this.props.navigation.state.params.wallet.ownerPublic)){
                    temOwnerKey=authTempOwner[i].key;
                }
            }

            for(var i=0;i<authTempActive.length;i++){
                if((authTempActive[i].key == this.props.navigation.state.params.wallet.activePublic)||(authTempActive[i].key == this.props.navigation.state.params.wallet.ownerPublic)){
                    temActiveKey=authTempActive[i].key;
                }
            }

            this.setState({
                activeThreshold:data.permissions[0].required_auth.threshold,
                ownerThreshold:data.permissions[1].required_auth.threshold,//owner权阀值

                ownerPk: temOwnerKey,
                activePk: temActiveKey,
            });
            // console.log("getaccountinfo=%s",JSON.stringify(data))
        } });
    }

  transferByOwner() {
    const { navigate } = this.props.navigation;
    navigate('AuthTransfer', { wallet:this.props.navigation.state.params.wallet});
  }

  manageByActive() {
    const { navigate } = this.props.navigation;
    navigate('AuthChange', { wallet:this.props.navigation.state.params.wallet});
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={styles.container}>
        

      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.header}>
            <View style={styles.inptoutbg}>
                {this.state.ownerPk != '' && <View style={styles.addUserTitle} >
                    <View style={{flex:1,flexDirection: "row",}}>
                        <View style={{flex:1,flexDirection: "column",}}>
                            <View style={styles.titleStyle}>
                                <View style={styles.userAddView}>
                                    <Text style={styles.inptitle}> Owner关联公钥（拥有者）</Text>
                                </View>
                                <View style={styles.buttonView}>
                                    <Text style={styles.weightText}>权重阈值  </Text>
                                    <Text style={styles.buttonText}>{this.state.activeThreshold}</Text>
                                </View>
                            </View>
                            <View style={styles.showPkStyle}>
                                <Text style={styles.inptext}>{this.state.ownerPk}</Text>
                            </View>
                        </View>

                        <TouchableHighlight onPress={() => { this.transferByOwner() }} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                            <View style={styles.enterButton}> 
                                <Ionicons color={UColor.fontColor} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(21)} color={UColor.arrow} />     
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>}

               {this.state.activePk != '' && <View style={styles.addUserTitle} >
                    <View style={{flex:1,flexDirection: "row",}}>
                        <View style={{flex:1,flexDirection: "column",}}>
                            <View style={styles.titleStyle}>
                                <View style={styles.userAddView}>
                                    <Text style={styles.inptitle}> Active关联公钥（管理者）</Text>
                                </View>
                                <View style={styles.buttonView}>
                                    <Text style={styles.weightText}>权重阈值  </Text>
                                    <Text style={styles.buttonText}>{this.state.activeThreshold}</Text>
                                </View>
                            </View>
                            <View style={styles.showPkStyle}>
                                <Text style={styles.inptext}>{this.state.activePk}</Text>
                            </View>
                        </View>

                        <TouchableHighlight onPress={() => { this.manageByActive() }} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                            <View style={styles.enterButton}> 
                                <Ionicons color={UColor.fontColor} name="ios-arrow-forward-outline" size={ScreenUtil.setSpText(21)} color={UColor.arrow} />     
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>}



            </View>
            <View style={styles.textout}>
                <Text style={styles.titletext}>什么是拥有者权限（Owner）？</Text>
                <Text style={styles.explaintext}>Owner 代表了对账户的所有权，可以对权限进行设置，管理Active和其他角色。</Text>
                <Text style={styles.titletext}>什么是管理者权限（Active）？</Text>
                <Text style={styles.explaintext}>Active 用于日常使用，比如转账，投票等。</Text>
                <Text style={styles.titletext}>什么是权重阈值？</Text>
                <Text style={styles.explaintext}>权重阈值是使用该权限的最低权重要求。</Text>
            </View>
        </View>
      </ScrollView>
    </View>
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
        marginTop: 10,
        backgroundColor: UColor.secdColor,
    },
    inptoutbg: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,

        // backgroundColor: UColor.mainColor,
    //     paddingHorizontal: 20,
    //     paddingTop: 20,
    //     paddingBottom: 30,
    },


        //添加用户
    addUserTitle: {
        flex: 1,
        // marginTop: 1,
        margin: 5,
        paddingBottom: 10,
        backgroundColor: UColor.mainColor,
        borderRadius: 5,
    },
    titleStyle:{
        flex:1,
        marginTop: 5,
        marginBottom: 1,
        marginLeft:11,
        // marginRight:12,
        flexDirection:'row',
    },


     //用户添加样式  
     userAddView: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

    inptoutgo: {
        paddingBottom: 20,
        backgroundColor: UColor.mainColor,
    },
    inptoutgoOwner: {
        paddingBottom: 20,
        backgroundColor: UColor.mainColor,
    },
    inptitle: {
        // flex: 1,
        fontSize: 15,
        lineHeight: 30,
        color: UColor.fontColor,
    },
     // 按钮  
    buttonView: {
        flexDirection: "row",
        // paddingHorizontal: 5,
        paddingRight: 10,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    weightText: {
        fontSize: 12,
        lineHeight: 30,
        color:  UColor.arrow,
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 30,
        color:  UColor.fontColor,
    },

    inptgo: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        // backgroundColor: UColor.secdColor,
    },

    showPkStyle: {
        flex: 1,
        fontSize: 15,
        paddingRight: 10,
        // paddingHorizontal: 10,
        // paddingVertical: 10,
        // textAlignVertical: 'top',
        marginLeft:15,
        marginRight:5,
        // borderColor: UColor.arrow,
        // borderWidth: 1,
        borderRadius: 5,
    },



    inptext: {
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
    },
    textout: {
            marginTop: 100,
            paddingLeft: 20,
            paddingRight: 30,
            paddingVertical: 20,
    },
    titletext: {
        fontSize: 15,
        color: UColor.fontColor,
        paddingVertical: 8,
    },
    explaintext: {
        fontSize: 13,
        color: UColor.arrow,
        // paddingLeft: 20,
        paddingVertical: 5,
        marginBottom: 10,
        // lineHeight: 25,
    },
    imgBtn: {
        width: 30,
        height: 30,
        marginBottom: 5,
        marginHorizontal:5,
      },


     // 按钮  
    enterButton: {
        flex: 1,
        paddingTop: 10,
        flexDirection: "row",
        paddingHorizontal: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bomout: {
        paddingHorizontal: 5,
        width: ScreenUtil.autowidth(40),
        justifyContent: 'center',
        alignItems: 'flex-end',
      },

});

export default AuthManage;
