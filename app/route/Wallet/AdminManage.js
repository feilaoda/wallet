import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,KeyboardAvoidingView,TouchableOpacity,TouchableHighlight} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'

import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
@connect(({login}) => ({...login}))
class AdminManage extends BaseComponent {

  static navigationOptions = {
    headerTitle: '权限管理',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
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
            ownerPk: this.props.navigation.state.params.wallet.ownerPublic,
            activePk: this.props.navigation.state.params.wallet.activePublic,
        })
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
    // Clipboard.setString(this.state.activePk);
    const { navigate } = this.props.navigation;
    navigate('AdminChange', { wallet:this.props.navigation.state.params.wallet});
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={styles.container}>
        

      <ScrollView keyboardShouldPersistTaps="always">
        <View style={styles.header}>
            <View style={styles.inptoutbg}>

                {this.state.activePk != '' && <View style={styles.inptoutgo} >
                    <View style={{flexDirection:'row',flex:1}}>
                        <Text style={styles.inptitle}>Active关联公钥（管理者）</Text>
                        <TouchableHighlight onPress={() => { this.manageByActive() }} style={{flex: 1,}} activeOpacity={0.5} underlayColor={UColor.mainColor}>
                            <View style={styles.buttonView}>
                                <Image source={UImage.adminAddB} style={styles.imgBtn} />
                                <Text style={styles.buttonText}>添加用户</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={styles.inptgo}>
                        <Text style={styles.inptext}>{this.state.activePk}</Text>
                    </View>
                </View>
                }

                {this.state.ownerPk != '' && <View style={styles.inptoutgo} >
                    <View style={{flexDirection:'row',}}>
                        <Text style={styles.inptitle}>Owner关联公钥（拥有者）</Text>
                        <TouchableHighlight onPress={() => { this.transferByOwner() }} style={{flex: 1,}} activeOpacity={1} underlayColor={UColor.mainColor}>
                            <View style={styles.buttonView}>
                                <Image source={UImage.adminB} style={styles.imgBtn} />
                                <Text style={styles.buttonText}>过户操作</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={styles.inptgo}>
                        <Text style={styles.inptext}>{this.state.ownerPk}</Text>
                    </View>
                </View>
                }
            </View>
            <View style={styles.textout}>
                <Text style={styles.titletext}>什么是拥有者权限？</Text>
                <Text style={styles.explaintext}>Owner 代表了对账户的所有权，用于账号过户操作。</Text>
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
        backgroundColor: UColor.mainColor,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    inptoutgo: {
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
        height: 60,
        paddingHorizontal: 10,
        backgroundColor: UColor.secdColor,
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
        width: 20,
        height: 20,
        lineHeight:30,
        marginBottom: 5,
        marginHorizontal:5,
      },
});

export default AdminManage;
