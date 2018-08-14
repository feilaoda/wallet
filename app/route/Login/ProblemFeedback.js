import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyShowLD } from "../../components/EasyShow"
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
let {width, height} = Dimensions.get('window');

var dismissKeyboard = require('dismissKeyboard');
@connect(({login}) => ({...login}))
class ProblemFeedback extends BaseComponent {

  static navigationOptions = {
    title: '问题反馈',
    headerStyle: {
        paddingTop:Platform.OS == 'ios' ? ScreenUtil.autoheight(30) : ScreenUtil.autoheight(20),
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
      },
  };

  constructor(props) {
    super(props);
    this.state = {
        delegatebw: "",
    };
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  logout = () =>{
    if (this.state.delegatebw == '') {
        EasyToast.show('请输入问题反馈');
        return;
    }else{
        EasyShowLD.loadingShow('正在提交');
        setTimeout( ()  =>{
            EasyShowLD.loadingClose();
            EasyToast.show("提交成功，非常感谢您对EosToken的支持！");
            this.setState({
                delegatebw: '',
            });
          },3000)  
    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={styles.container}>
            

     <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="always">
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
            <View style={{paddingHorizontal: ScreenUtil.autowidth(10), paddingTop: ScreenUtil.autoheight(20),}}>
                <View style={{paddingHorizontal: ScreenUtil.autowidth(20),paddingVertical: ScreenUtil.autoheight(20),}}>
                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegatebw} 
                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#B3B3B3" 
                onChangeText={(delegatebw) => this.setState({ delegatebw })} autoFocus={false} editable={true}
                placeholder="请详细描述您的问题......" underlineColorAndroid="transparent"   
                multiline={true}  maxLength={500}/>
                </View>
                <Text style={{fontSize: ScreenUtil.setSpText(14), color: '#8696B0', lineHeight:  ScreenUtil.autoheight(25), paddingHorizontal:ScreenUtil.autowidth(5),}}>说明：如果您提交的问题或建议被官方采纳，我们将进行电话回访和颁发一定的奖励作为鼓励。</Text>
                <Button onPress={() => this.logout()}>
                    <View style={{height:ScreenUtil.autoheight(47), marginTop: ScreenUtil.autoheight(30), backgroundColor:  UColor.tintColor,justifyContent:'center',alignItems:'center',borderRadius:5}}>
                    <Text style={{fontSize:ScreenUtil.setSpText(15),color:'#fff'}}>提交</Text>
                    </View>
                </Button>
            </View>
        </TouchableOpacity>
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
  inpt: {
    flex: 1, 
    color: '#8696B0', 
    fontSize: ScreenUtil.setSpText(14),
    textAlignVertical: 'top', 
    height: ScreenUtil.autoheight(266), 
    lineHeight: ScreenUtil.autoheight(25),
    paddingLeft: ScreenUtil.autowidth(10), 
    backgroundColor: '#FFFFFF', 
},
});

export default ProblemFeedback;
