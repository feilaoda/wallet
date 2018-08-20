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
var dismissKeyboard = require('dismissKeyboard');
@connect(({login}) => ({...login}))
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
      }
  }
    //组件加载完成
    componentDidMount() {
        this.setState({
            ownerPk: this.props.navigation.state.params.wallet.ownerPublic,//ownerPublic
            activePk: this.props.navigation.state.params.wallet.activePublic,
        })
    }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
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

                {this.state.activePk != '' && <View style={styles.addUserTitle} >
                    <View style={{flexDirection:'row',flex:1}}>
                        <Text style={styles.inptitle}> Active关联公钥（管理者）</Text>
                        <TouchableHighlight onPress={() => { this.manageByActive() }} style={{flex: 1,}} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                            <View style={styles.buttonView}>
                                <Image source={UImage.adminAddB} style={styles.imgBtn} />
                            </View>
                        </TouchableHighlight>
                    </View>

                    <View style={styles.inptgo}>
                        <Text style={styles.inptext}>{this.state.activePk.substr(0, 26)}</Text>
                        <Text style={styles.inptext}>{this.state.activePk.substr(26)}</Text>
                    </View>

                </View>
                }

                {this.state.ownerPk != '' && <View style={styles.addUserTitle} >
                    <View style={{flexDirection:'row',flex:1}}>
                        <Text style={styles.inptitle}> Owner关联公钥（拥有者）</Text>
                        <TouchableHighlight onPress={() => { this.transferByOwner() }} style={{flex: 1,}} activeOpacity={1} underlayColor={UColor.mainColor}>
                            <View style={styles.buttonView}>
                                <Image source={UImage.adminAddB} style={styles.imgBtn} />
                            </View>
                        </TouchableHighlight>
                    </View>

                    <View style={styles.inptgo}>
                        <Text style={styles.inptext}>{this.state.ownerPk.substr(0, 26)}</Text>
                        <Text style={styles.inptext}>{this.state.ownerPk.substr(26)}</Text>
                    </View>


                </View>
                }
            </View>
            <View style={styles.textout}>
                <Text style={styles.titletext}>什么是拥有者权限？</Text>
                <Text style={styles.explaintext}>Owner 代表了对账户的所有权，可以对权限进行设置，管理Active和其他角色。</Text>
                <Text style={styles.titletext}>什么是管理者权限？</Text>
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
        paddingBottom: 5,
        backgroundColor: UColor.mainColor,
        margin:5,
        // marginTop: 5,
        // marginBottom: 10,
        // marginLeft:10,
        // marginRight:10,
        borderRadius: 5,
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
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 30,
        color:  UColor.tintColor,
    },

    inptgo: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        // backgroundColor: UColor.secdColor,
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
        width: 30,
        height: 30,
        marginBottom: 5,
        marginHorizontal:5,
      },
});

export default AuthManage;
