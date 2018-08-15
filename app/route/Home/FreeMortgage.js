import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, TextInput, Clipboard, ImageBackground, ScrollView } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'
import ScreenUtil from '../../utils/ScreenUtil'
var Dimensions = require('Dimensions')
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
@connect(({ vote, }) => ({ ...vote,}))
class FreeMortgage extends React.Component {

  static navigationOptions = {
    title: 'EOS免费抵押',  
    headerStyle:{
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
    }    
  };

  constructor(props) {
    super(props);
  }

  //加载地址数据
  componentDidMount() {
   
  }

  mortgageApply() {
    try {
        EasyShowLD.loadingShow('正在申请');
        this.props.dispatch({type: "vote/delegatebw", payload: {username:this.props.navigation.state.params.account_name}, callback:(mortgage) =>{
            EasyShowLD.dialogClose()
                // alert(JSON.stringify(mortgage));
                if(mortgage.data){
                    EasyToast.show("恭喜您！已经获得免费抵押，请到资源管理中查看")
                }else{
                    EasyToast.show("抱歉，您的账号已经有足够的资源")
                }
            }
        })           
    }catch (error) {

    }

  }

   
  render() {
    return (<View style={styles.container}>
        <View style={styles.head}>
            <ImageBackground style={styles.bgout} source={UImage.freemortgage_bg} resizeMode="cover">
                <Text style={styles.Explaintext}>本功能由EosToken提供，是免费帮助用户临时抵押资源使其账户能正常使用。</Text>
                <Text style={styles.Explaintext}>温馨提示：成功申请了免费抵押后，为了让账户正常使用，请尽快自行抵押。</Text>
                <Text style={styles.Tipstext}>可获：计算资源=2.5 EOS  网络资源=0.5 EOS</Text>
            </ImageBackground>
        </View>
        <View style={styles.btnout}>
            <Button onPress={() => this.mortgageApply()}>
                <View style={styles.Applyout}>
                    <Text style={styles.Applytext}>立即申请</Text>
                </View>
            </Button>
        </View>
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
        flex: 1,
        flexDirection: "row",
        paddingVertical: ScreenUtil.autoheight(30),
        paddingHorizontal: ScreenUtil.autowidth(10)
    },

    bgout: {
        width: maxWidth - ScreenUtil.autowidth(20),
        height: (maxWidth - ScreenUtil.autowidth(20))*0.8437,
        paddingTop: ScreenUtil.autoheight(70),
        paddingHorizontal: ScreenUtil.autowidth(20),
    },
    Explaintext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.arrow, 
        lineHeight: ScreenUtil.autoheight(30), 
        marginTop: ScreenUtil.autoheight(25),
    },
    Tipstext: {
        fontSize: ScreenUtil.setSpText(12),
        color: UColor.tintColor, 
        textAlign: 'right', 
        marginTop: ScreenUtil.autoheight(25),
    },
    btnout: {
        flex: 1,
        justifyContent: 'center',
    },
    Applyout: {
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenUtil.autoheight(45),
        backgroundColor: UColor.tintColor,
        marginHorizontal: ScreenUtil.autowidth(20),
        marginTop: ScreenUtil.autoheight(20),
       
    },
    Applytext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor
    },
});
export default FreeMortgage;