import React from 'react';
import { connect } from 'react-redux'
import {StyleSheet,View,Text,Image,Platform,TextInput,TouchableOpacity} from 'react-native';
import UImage from "../../utils/Img";
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from "../../components/EasyShow"
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
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
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={{flex: 1,}}>
            <View style={styles.textinptoue}>
                <View style={styles.inptout}>
                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegatebw} 
                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#B3B3B3" 
                    onChangeText={(delegatebw) => this.setState({ delegatebw })} autoFocus={false} editable={true}
                    placeholder="请详细描述您的问题......" underlineColorAndroid="transparent"   
                    multiline={true}  maxLength={300}/>
                </View>
                <Text style={styles.Explaintext}>说明：如果您提交的问题或建议被官方采纳，我们将进行电话回访和颁发一定的奖励作为鼓励。</Text>
                <Button onPress={() => this.logout()}>
                    <View style={styles.Submissionout}>
                      <Text style={styles.Submission}>提交</Text>
                    </View>
                </Button>
            </View>
            <View style={styles.logout}>
              <Image source={UImage.bottom_log} style={styles.logimg}/>
              <Text style={styles.logtext}>EosToken 专注柚子生态</Text>
            </View>
        </TouchableOpacity>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },
  textinptoue: {
    paddingHorizontal: ScreenUtil.autowidth(20),
    paddingTop: ScreenUtil.autoheight(20),
  },
  inptout: {
    height: ScreenUtil.autoheight(300),
    paddingHorizontal: ScreenUtil.autowidth(10),
    paddingVertical: ScreenUtil.autoheight(20),
  },
  inpt: {
    flex: 1, 
    color: UColor.arrow, 
    fontSize: ScreenUtil.setSpText(14),
    textAlignVertical: 'top', 
    backgroundColor: UColor.fontColor, 
    height: ScreenUtil.autoheight(266), 
    lineHeight: ScreenUtil.autoheight(25),
    paddingLeft: ScreenUtil.autowidth(10), 
  },
  Explaintext: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(25),
  },
  Submissionout: {
    height: ScreenUtil.autoheight(47),
    marginTop: ScreenUtil.autoheight(30),
    backgroundColor: UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  Submission: {
    fontSize: ScreenUtil.setSpText(15),
    color: UColor.fontColor
  },
  logout:{
    flex: 1,
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

export default ProblemFeedback;
