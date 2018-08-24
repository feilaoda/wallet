import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, StyleSheet, View, Text, Image, ImageBackground } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import { kapimg } from '../../utils/Api'
import Constants from '../../utils/Constants'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({ login }) => ({ ...login }))
class SignIn extends BaseComponent {

  static navigationOptions = {
    title: '用户积分',
    headerStyle: {
      paddingTop: ScreenUtil.autoheight(20),
      backgroundColor: UColor.secdColor,
      borderBottomWidth:0,
    },
  };

  
  constructor(props) {
    super(props);
    this.state = {
      phone: "",
      password: "",
      code: "",
      img: Constants.rootaddr+kapimg,
      kcode: "",
      currentPoint: 0,
      Sign_in: false,
      accumulative: 0,
      newaccumulative: 0,
      interval: 0,
      last: 0,
    }
  }

  componentDidMount() {
    EasyShowLD.loadingShow();
    this.props.dispatch({
      type: "login/fetchPoint", payload: { uid: Constants.uid }, callback:(data) =>{
        EasyShowLD.loadingClose();
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              this.props.navigation.goBack();
              EasyToast.show("登陆已失效, 请重新登陆!");
            }
          });         
        }else if(data.code == 0) {
          this.setState({
              accumulative: this.props.pointInfo.signin + this.props.pointInfo.share + this.props.pointInfo.interact + this.props.pointInfo.store + this.props.pointInfo.turnin + this.props.pointInfo.turnout,
          })

          this.setState({interval: (((this.state.accumulative / 50).toFixed(0) == 0) ? 1: (this.state.accumulative / 50).toFixed(0))});
          this.dynamic(this.state.last, this.state.accumulative);
        }
      },
    });
    this.props.dispatch({ type: 'login/isSigned', payload:{name: this.state.phone},callback: (data) => { 
      EasyShowLD.loadingClose();
      this.setState({Sign_in: data.data});
    } });
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  signIn = () => {
    const { dispatch } = this.props;
    this.props.dispatch({
      type: 'login/signin', payload: { name: this.state.phone }, callback: (data) => {
        if(data.code == 509){
          EasyToast.show(data.msg);
          this.setState({
            Sign_in: true,
          })
        }else if(data.code == 0) {
          EasyToast.show("签到成功");
          this.setState({last: this.state.accumulative});
          this.props.dispatch({ type: 'login/fetchPoint', payload: { uid: Constants.uid },callback:(data) =>{
            this.setState({
              Sign_in: true,
              accumulative:this.props.pointInfo.signin + this.props.pointInfo.share + this.props.pointInfo.interact + this.props.pointInfo.store + this.props.pointInfo.turnin + this.props.pointInfo.turnout,
            })
            this.setState({interval: (((this.state.accumulative - this.state.last) / 50).toFixed(0) == 0) ? 1: ((this.state.accumulative - this.state.last) / 50).toFixed(0)});
            this.dynamic(this.state.last, this.state.accumulative);
          } });
        } else {
          EasyToast.show(data.msg);
          this.setState({
            Sign_in: false,
          })
        }
        EasyShowLD.loadingClose();
      }
    })
  }

  dynamic(lastIntegral, integral){
    var num = lastIntegral;
    let timer = setInterval(()=>{
      num += this.state.interval;
      if(num < integral){
        this.setState({
          newaccumulative:num
        })
      }else if(num >= integral){
        this.setState({
          newaccumulative:integral
        })
        clearInterval(timer)
      }  

    },1);
  }

  render() {
    return <View style={styles.container}>
      <View style={styles.outsource}>
        <Text style={styles.promptText}> 温馨提示：连续签到将获得额外积分哦~</Text>
        <ImageBackground style={styles.imgbg} source={UImage.integral_bg} resizeMode="cover">
          <View style={styles.accumulativeout}>
            <Text style={styles.accumulativetext}>累计积分</Text>
            <Text style={styles.accumulative}>{this.state.newaccumulative}</Text>
          </View>
        </ImageBackground>
        <Image source={UImage.point_full} style={styles.imgsty} />           
        <View style={styles.sigshaint}>
          <Text style={styles.sigsto}>{this.props.pointInfo.signin}</Text>
          <Text style={styles.shatur}>{this.props.pointInfo.share}</Text>
          <Text style={styles.sigsto}>{this.props.pointInfo.interact}</Text>
        </View>
        <View style={styles.sigshainttext}>
          <Text style={styles.sigstotext}>签到累计</Text>
          <Text style={styles.shaturtext}>分享资讯</Text>
          <Text style={styles.sigstotext}>资讯互动</Text>
        </View>
        {/* <View style={styles.stotur}>
          <Text style={styles.sigsto}>{this.props.pointInfo.store}</Text>
          <Text style={styles.shatur}>{this.props.pointInfo.turnin}</Text>
          <Text style={styles.sigsto}>{this.props.pointInfo.turnout}</Text>
        </View> */}
        {/* <View style={styles.stoturtext}>
          <Text  style={styles.sigstotext}>资产存储</Text>
          <Text style={styles.shaturtext}>转入累计</Text>
          <Text style={styles.sigstotext}>转出累计</Text>
        </View> */}
      </View>
      <Button onPress={() => this.signIn()}>
        <View style={styles.SignInbtnout} backgroundColor={this.state.Sign_in ? UColor.mainColor:UColor.tintColor}>
          <Text style={styles.SignInbtntext}>{this.state.Sign_in ? "已签到": "立即签到"}</Text>
        </View>
      </Button>
      <Text style={styles.foottop}>积分细则</Text>
      <Text style={styles.foottext}>1.签到每日可获得积分+1，连续签到可额外增加积分；</Text>
      <Text style={styles.foottext}>2.分享资讯到朋友圈或微信好友每日可获得积分+1；</Text>
      <Text style={styles.foottext}>3.资讯浏览点评每日可获得积分+1；</Text>
      <Text style={styles.footbom}>4.积分可兑换官方礼品和提高用户权益，官方将会在后续开发积分价值体系，让拥有更多积分的用户享受官方VIP服务，敬请期待。</Text>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  outsource: {
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  promptText: {
    color: UColor.arrow,
    margin: ScreenUtil.autowidth(10),
    fontSize: ScreenUtil.setSpText(14),
  },
  imgbg: {
    justifyContent: "center",
    alignItems: 'center',
    marginHorizontal: (ScreenWidth-ScreenUtil.autowidth(169)) /2,
    width: ScreenUtil.autowidth(169),
    height: ScreenUtil.autoheight(169),
  },
  accumulativeout: {
    alignItems: 'center',
    flexDirection: "column",
    justifyContent: "center",
    margin: ScreenUtil.autowidth(10),
  },
  accumulativetext: {
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(14),
    marginBottom: ScreenUtil.autoheight(10),
  },
  accumulative: {
    color: UColor.fontColor,
    fontSize: ScreenUtil.setSpText(28),
    marginLeft: ScreenUtil.autowidth(2),
    paddingBottom: ScreenUtil.autoheight(2),
  },
  imgsty: { 
    alignSelf: 'center', 
    justifyContent: 'center', 
    width: ScreenUtil.autowidth(320), 
    height: ScreenUtil.autoheight(25), 
    marginTop: ScreenUtil.autoheight(10), 
  },

  sigshaint: { 
    flexDirection: "row",
    justifyContent: 'space-around',
    marginTop: ScreenUtil.autoheight(20) 
  },
  sigshainttext: { 
    flexDirection: "row",
    justifyContent: 'space-around',
    marginTop: ScreenUtil.autoheight(5) 
  },
  stotur: { 
    flexDirection: "row", 
    justifyContent: 'space-around',
    marginTop: ScreenUtil.autoheight(10) 
  },
  stoturtext: { 
    flexDirection: "row", 
    justifyContent: 'space-around',
    marginBottom: ScreenUtil.autoheight(20), 
  },
  sigsto: { 
    textAlign: "center", 
    alignSelf: 'center', 
    color: UColor.fontColor, 
    fontSize: ScreenUtil.setSpText(16), 
  },
  sigstotext: { 
    textAlign: "center", 
    color: UColor.arrow, 
    fontSize: ScreenUtil.setSpText(14), 
  },
  shatur: { 
    textAlign: "center", 
    alignSelf: 'center', 
    color: UColor.fontColor, 
    fontSize: ScreenUtil.setSpText(16), 
  },
  shaturtext: { 
    color: UColor.arrow,
    textAlign: "center", 
    fontSize: ScreenUtil.setSpText(14), 
  },
  SignInbtnout: {

    height: ScreenUtil.autoheight(45),
    justifyContent: 'center',
    alignItems: 'center',
    margin: ScreenUtil.autowidth(10),
    marginTop: ScreenUtil.autoheight(25),
    borderRadius: 5
  },
  SignInbtntext: {
    fontSize: ScreenUtil.setSpText(15),
    color: UColor.fontColor
  },
  foottop: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(40), 
    marginLeft: ScreenUtil.autowidth(20),
    marginTop: ScreenUtil.autoheight(10),
  },
  foottext: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(25),
    marginLeft: ScreenUtil.autowidth(15),
  },
  footbom: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(14),
    lineHeight: ScreenUtil.autoheight(20),
    marginLeft: ScreenUtil.autowidth(15),
  },
});

export default SignIn;
