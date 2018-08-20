import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, ListView, StyleSheet, Image, View, Text, Linking, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground, ScrollView } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { EasyShowLD } from '../../components/EasyShow'
import ScreenUtil from '../../utils/ScreenUtil'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ vote }) => ({ ...vote}))
class FunctionsMore extends React.Component {

  static navigationOptions = {
    title: '全部',  
    headerStyle:{
        paddingTop: ScreenUtil.autoheight(20),
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
    }    
  };

  constructor(props) {
    super(props);
    this.state = {
        Tokenissue: false,
    }
  }

  //加载地址数据
  componentDidMount() {
  
  }

  onPress(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Receivables') {
        AnalyticsUtil.onEvent('Receipt_code');
        navigate('TurnIn', {});
    }else if (key == 'transfer') {
      navigate('TurnOut', { coins:'EOS', balance: this.props.navigation.state.params.balance });
    }else if (key == 'Resources') {
      navigate('Resources', {account_name:this.props.navigation.state.params.account_name});
    }else if(key == 'candy'){
      Linking.openURL("https://eosdrops.io/");
    }else if(key == 'Bvote'){
      navigate('Bvote', {});
    }else if(key == 'Tokenissue'){
      this. _setModalVisible();
    }else if(key == 'FreeMortgage'){
        navigate('FreeMortgage');
    }else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

    // 显示/隐藏 modal  
    _setModalVisible() {  
        let isTokenissue = this.state.Tokenissue;  
        this.setState({  
            Tokenissue:!isTokenissue,  
        });  
    } 

    openTokenissue() {
        this. _setModalVisible();
        Linking.openURL("https://coincreate.github.io/EOS_coincreate/coincreate.html");
    }
  
  render() {
    return (<View style={styles.container}>
        <View style={styles.head}>
            <Button onPress={this.onPress.bind(this, 'Receivables')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.qr} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>收币</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'transfer')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.transfer} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>转账</Text>
                </View>
            </Button>
            <Button  onPress={this.onPress.bind(this, 'Resources')}  style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.resources} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>资源管理</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'Tokenissue')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.tokenissue} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>发行代币</Text>
                </View>                      
            </Button>
        </View>
        <View style={styles.head}>
            <Button onPress={this.onPress.bind(this, 'Bvote')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.vote_node} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>节点投票</Text>
                </View>                      
            </Button>
            <Button onPress={this.onPress.bind(this, 'candy')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.candy} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>糖果信息</Text>
                </View>
            </Button>
            <Button onPress={this.onPress.bind(this, 'FreeMortgage')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                    <Image source={UImage.free_mortgage} style={styles.imgBtn} />
                    <Text style={styles.headbtntext}>免费抵押</Text>
                </View>
            </Button>
        </View>
        <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.state.Tokenissue} onRequestClose={()=>{}}>
            <TouchableOpacity style={styles.pupuoBackup} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-30, backgroundColor: UColor.fontColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._setModalVisible.bind(this) } style={styles.buttonView2}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={30} />
                  </Button>
                </View>
                <Text style={styles.contentText}>使用说明</Text>
                <View style={styles.warningout}>
                    <Image source={UImage.warning_h} style={styles.imgBtnBackup} />
                    <Text style={styles.headtitle}>免责声明：本功能由第三方平台提供，不属于EosToken官方出品，《用户协议》和《应用风险》由该平台单独向您承担责任！</Text>
                </View>
                <View style={{ width: ScreenWidth-70,marginHorizontal: ScreenUtil.autowidth(20), marginVertical: ScreenUtil.autoheight(10),}}>
                    <Text style={styles.centertext}>3分钟，3EOS！最方便，最便宜的EOS自助发币DAPP。</Text>
                    <Text style={styles.centertext}>开发：清华大学计算机专业博士生莫与独立编写。</Text>
                    <Text style={styles.centertext}>功能：帮助大家自助地发行基于EOS代币。价格比大家自己发币便宜了13倍！</Text>
                    <Text style={styles.centertext}>流程：</Text>
                    <Text style={styles.centertext}>1.根据指导生成自己代币的MEMO。</Text>
                    <Text style={styles.centertext}>2.给指定合约账号转账3EOS，并备注之前生成的MEMO。</Text>
                    <Text style={styles.centertext}>3.在eostoken钱包中添加代币（添加公众号“深入浅出EOS”回复“eostoken”获取教程）</Text>
                </View>
                <Button onPress={this.openTokenissue.bind(this)} style={{}}>
                    <View style={styles.deleteout}>
                        <Text style={styles.deletetext}>知道了</Text>
                    </View>
                </Button>  
                </View> 
            </TouchableOpacity>
        </Modal>
    </View>
    );
  }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: UColor.secdColor,
        paddingTop: ScreenUtil.autoheight(10),
    },
    head: {
        height: ScreenUtil.autoheight(70), 
        paddingBottom: ScreenUtil.autoheight(10),
        flexDirection: "row",
        backgroundColor: UColor.inash, 
    },
    headbtn: {
        width: ScreenWidth/4,
        justifyContent: "center", 
        alignItems: 'center',
    },
    headbtnout: {
        flex:1, 
        alignItems: 'center', 
        justifyContent: "center",
    },
    imgBtn: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autoheight(30),
        margin: ScreenUtil.autowidth(5),
    },
    headbtntext: {
        color: UColor.lightgray,
        fontSize: ScreenUtil.setSpText(14),
    },

    touchableouts: {
        flex: 1,
        flexDirection: "column",
    },

    pupuoBackup: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: UColor.mask,
    },

    subViewBackup: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: ScreenWidth - 30,
        height: ScreenUtil.autoheight(30),
    },
    buttonView2: {
        width: ScreenUtil.autowidth(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentText: {
        fontSize: ScreenUtil.setSpText(18),
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: ScreenUtil.autoheight(5),
    },
    imgBtnBackup: {
        width: ScreenUtil.autowidth(30),
        height: ScreenUtil.autoheight(30),
        margin: ScreenUtil.autowidth(5),
    },
    headtitle: {
        flex: 1,
        color: UColor.showy,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(20),
        paddingLeft: ScreenUtil.autowidth(10),
    },
    headout: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(15),
    },
    warningout: {
        width: ScreenWidth - 60,
        marginHorizontal: ScreenUtil.autowidth(15),
        flexDirection: "row",
        alignItems: 'center',
        borderColor: UColor.showy,
        borderWidth: 1,
        borderRadius: 5,
    },
    centertext: {
        fontSize: ScreenUtil.setSpText(12),
        lineHeight: ScreenUtil.autoheight(20),
        color: UColor.secdColor,
    },
    deleteout: {
        height: ScreenUtil.autoheight(40),
        marginHorizontal: ScreenUtil.autowidth(100),
        marginVertical: ScreenUtil.autoheight(15),
        borderRadius: 3,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deletetext: {
        fontSize: ScreenUtil.setSpText(16),
        color: UColor.fontColor
    },
      
});
export default FunctionsMore;