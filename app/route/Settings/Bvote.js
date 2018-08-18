import React from 'react';
import { connect } from 'react-redux'
import { Animated,DeviceEventEmitter,StyleSheet,Image,View,Text,Platform,Dimensions,TouchableHighlight,ImageBackground,} from 'react-native';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({vote, wallet}) => ({...vote, ...wallet}))
class Bvote extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        return {    
          title: "节点投票",
          headerStyle: {
            paddingTop: ScreenUtil.autoheight(20),
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
          headerRight: (<Button onPress={navigation.state.params.onPress}>
            <Text style={{color: UColor.arrow, fontSize: ScreenUtil.setSpText(18),justifyContent: 'flex-end',paddingRight: ScreenUtil.autowidth(15)}}>邀请投票</Text>
          </Button>),            
        };
    };

  _rightTopClick = () =>{  
    DeviceEventEmitter.emit('voteShare',""); 
  }  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      value: false,
      showShare:false,
      news:{},
      arr: 0,
    }
  }

  componentDidMount() {
    EasyShowLD.loadingShow();
    this.props.dispatch({
        type: 'wallet/getDefaultWallet', callback: (data) => {     
            this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: (data) => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account}, callback: (data) => {
                    this.setState({
                        arr : this.props.producers.length,
                    });
                } });
                EasyShowLD.loadingClose();
            }});
        }
    })
  }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'delegate'){
      navigate('Delegate', {});
    }else if (key == 'Imvote') {
      navigate('Imvote', {});
    }else if (key == 'Nodevoting') {
      navigate('Nodevoting', {});
    }else {
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                 <View style={styles.outsource}>
                    <View style={styles.headoutsource}>
                        <Text style={styles.headSizeone}>进度：37.131%</Text>
                        <Text style={styles.headSizetwo}>可投票数：{30 - this.state.arr}</Text>
                    </View>
                    <View>
                      <View style={styles.Underschedule}></View> 
                      <View style={styles.Aboveschedule}>
                        <View style={styles.Abovestrip}></View>
                        <View style={styles.Abovecircular}></View>
                      </View>                     
                    </View>             
                </View>
                {/* <TouchableHighlight  onPress={this.goPage.bind(this, 'delegate')}>
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votea_bj} resizeMode="stretch">                               
                      <Text style={styles.locktitle}>投票前划分锁仓</Text>
                      <View style={styles.locktext}>
                          <Image source={UImage.votea} style={styles.lockimg}/>
                      </View>  
                  </ImageBackground>
                </TouchableHighlight>  */}
                <TouchableHighlight onPress={this.goPage.bind(this, 'Imvote')}>
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votea_bj} resizeMode="stretch">              
                    <Text style={styles.locktitle}>我的投票</Text>
                    <View style={styles.locktext}>
                        <Image source={UImage.voteb} style={styles.lockimg}/>
                    </View>     
                  </ImageBackground>     
                </TouchableHighlight> 
                <TouchableHighlight onPress={this.goPage.bind(this, 'Nodevoting')} >      
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votec_bj} resizeMode="stretch">              
                    <Text style={styles.locktitle}>超级节点</Text>
                    <View style={styles.locktext}>
                        <Image source={UImage.votec} style={styles.lockimg}/>
                    </View>     
                  </ImageBackground>  
                </TouchableHighlight>       
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
    padding: ScreenUtil.autowidth(6),
  },

  outsource: {
    padding: ScreenUtil.autowidth(20),
    height: ScreenUtil.autoheight(78),
    borderRadius: 5, 
    backgroundColor: UColor.mainColor,
  },

  headoutsource: {
    marginBottom: ScreenUtil.autoheight(15),
    flexDirection:'row', 
    alignItems: "center",
    justifyContent: "center", 
  },

  headSizeone: {
    fontSize: ScreenUtil.setSpText(12), 
    color: UColor.fontColor,
    marginRight: ScreenUtil.autowidth(10),
  },

  headSizetwo: {
    marginLeft: ScreenUtil.autowidth(10),
    fontSize: ScreenUtil.setSpText(12), 
    color: UColor.fontColor
  },

  Underschedule: {
    height: ScreenUtil.autoheight(2), 
    backgroundColor: UColor.secdColor, 
    position:'relative', 
    top: ScreenUtil.autoheight(3),
  },

  Aboveschedule: {
    flexDirection:'row', 
    alignItems: 'center', 
    position:'absolute', 
    width: '100%',
  },
  Abovestrip: {
    width: '24.2218%',
    height: ScreenUtil.autoheight(2),
    backgroundColor: UColor.tintColor,
  },

  Abovecircular: {
    width: ScreenUtil.autowidth(8), 
    height: ScreenUtil.autowidth(8),  
    backgroundColor: UColor.tintColor, 
    borderRadius: 5,
  },

  lockoutsource: {
    justifyContent: "flex-end", 
    alignItems: 'center', 
    flexDirection:'row', 
    width: ScreenWidth-10, 
    height: ScreenUtil.autoheight(115), 
    marginTop: ScreenUtil.autoheight(6), 
    paddingRight: ScreenUtil.autowidth(10),
  },

  locktitle: {
    fontSize:ScreenUtil.setSpText(16), 
    color: UColor.fontColor
  },

  locktext: {
    justifyContent: 'center', 
    alignItems: 'center',
  },

  lockimg: {
    width: ScreenUtil.autowidth(30), 
    height: ScreenUtil.autowidth(30), 
    margin: ScreenUtil.autowidth(10),
  },


})
export default Bvote;