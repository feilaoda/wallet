import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Clipboard,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import QRCode from 'react-native-qrcode-svg';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import ViewShot from "react-native-view-shot";
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
import moment from 'moment';
var WeChat = require('react-native-wechat');
let {width, height} = Dimensions.get('window');
var dismissKeyboard = require('dismissKeyboard');
@connect(({login}) => ({...login}))
class TradeDetails extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: '交易详情',
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
            headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ padding: 15 }}>
            <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
            </View>
          </Button>),   
        };
    };

  constructor(props) {
    super(props);
    var paramtrade = new Object();

    if(this.props.navigation.state.params.trade){
      paramtrade = this.props.navigation.state.params.trade;
      paramtrade.disptype = 0;
    }else if(this.props.navigation.state.params.transaction){
      paramtrade.disptype = 1;
      paramtrade.type = this.props.navigation.state.params.transaction.action_name;
      paramtrade.quantity = this.props.navigation.state.params.transaction.eos_qty;
      paramtrade.code = "";
      paramtrade.description = "";
      paramtrade.bytes = "";
      paramtrade.memo = "";
      paramtrade.blockTime = this.props.navigation.state.params.transaction.record_date;
      paramtrade.transactionId = this.props.navigation.state.params.transaction.trx_id;
      paramtrade.from = this.props.navigation.state.params.transaction.account;
      paramtrade.to = "";
      paramtrade.blockNum = this.props.navigation.state.params.transaction.block_num;

    }else if(this.props.navigation.state.params.ramtransaction){
      paramtrade.disptype = 2;
      paramtrade.type = this.props.navigation.state.params.ramtransaction.action_name;
      paramtrade.quantity = this.props.navigation.state.params.ramtransaction.eos_qty;
      paramtrade.code = "";
      paramtrade.description = "";
      paramtrade.bytes = "";
      paramtrade.memo = "";
      paramtrade.blockTime = this.props.navigation.state.params.ramtransaction.record_date;
      paramtrade.transactionId = this.props.navigation.state.params.ramtransaction.trx_id;
      paramtrade.from = this.props.navigation.state.params.ramtransaction.payer;
      paramtrade.to = this.props.navigation.state.params.ramtransaction.receiver;
      paramtrade.blockNum = this.props.navigation.state.params.ramtransaction.block_num;  
    }
    else{
      //防止出错，正常情况，不应该到这里
      paramtrade.disptype = 0;
      paramtrade.type = "";
      paramtrade.quantity = "";
      paramtrade.code = "";
      paramtrade.description = "";
      paramtrade.bytes = "";
      paramtrade.memo = "";
      paramtrade.blockTime = "";
      paramtrade.transactionId = "";
      paramtrade.from = "";
      paramtrade.to = "";
      paramtrade.blockNum = 0;  
    }

    WeChat.registerApp('wxc5eefa670a40cc46');
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
       trade: paramtrade,
    };
  }

  _rightTopClick = () =>{
    this.refs.viewShot.capture().then(uri => {
      WeChat.isWXAppInstalled().then((isInstalled) => {
          EasyShowLD.dialogClose();
          if (isInstalled) {
            WeChat.shareToSession({ type: 'imageFile', imageUrl: uri })
              .catch((error) => {
                EasyToast.show(error.message);
              });
          } else {
            EasyToast.show('没有安装微信软件，请您安装微信之后再试');
          }
        });
    });
  }


  componentDidMount() {
        //alert('trade: '+JSON.stringify(this.props.navigation.state.params.trade));
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  prot(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'transactionId') {
    navigate('Web', { title: "交易查询", url:'https://eospark.com/MainNet/tx/' + this.state.trade.transactionId});
    }else  if (key == 'from') {
    navigate('Web', { title: "发送方", url:'https://eospark.com/MainNet/account/' + this.state.trade.from});
    }else  if (key == 'to') {
    navigate('Web', { title: "接受方", url:'https://eospark.com/MainNet/account/' + this.state.trade.to});
    }else  if (key == 'blockNum') {
    if(this.state.trade.blockNum == null || this.state.trade.blockNum == ""){
      return;
    }
    navigate('Web', { title: "区块高度", url:'https://eospark.com/MainNet/block/' + this.state.trade.blockNum});
    }
  }




  copy = (trade) => {
    Clipboard.setString('https://eospark.com/MainNet/tx/' + trade.transactionId);
    EasyToast.show("复制成功");
  }
  
  render() {
    // const c = this.props.navigation.state.params.trade;
    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <ViewShot ref="viewShot"> 
     
      <View style={{flex: 1}}>
        {this.state.trade.disptype == 0 && <View style={styles.header}>
            <View style={styles.headout}>
                <Text style={styles.quantitytext}>{this.state.trade.type=='转出'?'-':'+'} </Text>
                <Text style={styles.quantitytext}>{this.state.trade.quantity.replace(this.state.trade.code, "")} </Text>
                <Text style={styles.headtext}> {this.state.trade.code}</Text>
            </View>
            <Text style={styles.description}>({this.state.trade.description}{this.state.trade.bytes? this.state.trade.bytes + " bytes":""})</Text>
          </View>
        }
        {this.state.trade.disptype == 1 && <View style={styles.header}>
            <View style={styles.headout}>
                {/* <Text style={styles.quantitytext}>{transaction.action_name == 'selltoken'?'+':'-'} </Text> */}
                <Text style={styles.quantitytext}>{this.state.trade.quantity}</Text>
                {/* <Text style={styles.headtext}> {transaction.eos_qty}</Text> */}
            </View>
            <Text style={styles.description}>{this.state.trade.type == 'selltoken'?'(卖)':'(买)'}</Text>
          </View>
        }
        {this.state.trade.disptype == 2 && <View style={styles.header}>
            <View style={styles.headout}>
                {/* <Text style={styles.quantitytext}>{c.type=='转出'?'-':'+'} </Text> */}
                <Text style={styles.quantitytext}>{this.state.trade.quantity} </Text>
                {/* <Text style={styles.headtext}> {c.code}</Text> */}
            </View>
            <Text style={styles.description}>{this.state.trade.type == 'buyram'?'(买)':'(卖)'}</Text>
          </View>
        }
        <View style={{flexDirection: "row", borderBottomColor: UColor.mainColor, borderBottomWidth: 0.5,paddingHorizontal: 10,paddingVertical: 20,}}>
          <View style={styles.conout}>
            <View style={styles.conouttext}>
              <Text style={styles.context}>发  送  方：</Text> 
              <Text style={styles.tintext} onPress={this.prot.bind(this, 'from')}>{this.state.trade.from}</Text>
            </View>
            <View style={styles.conouttext}>
              <Text style={styles.context}>接  受  方：</Text>
              <Text style={styles.tintext} onPress={this.prot.bind(this, 'to')}>{this.state.trade.to}</Text>
            </View>
            <View style={styles.conouttext}> 
              <Text style={styles.context}>区块高度：</Text>
              {(this.state.trade.blockNum == null || this.state.trade.blockNum == "") ? 
              <Text style={styles.showytext}>未确认</Text>:
              <Text style={styles.tintext} onPress={this.prot.bind(this, 'blockNum')}>{this.state.trade.blockNum}</Text>
              }
            </View>
            <View style={styles.conouttext}>
              <Text style={styles.context}> 备     注 ：</Text>
              <Text style={styles.blocktext} >{this.state.trade.memo}</Text>
            </View>
          </View>
          <View style={styles.codeout}>
            <View style={styles.qrcode}>
               <QRCode size={70} value={'https://eospark.com/MainNet/tx/' + this.state.trade.transactionId } />
            </View>
            <Button onPress={this.copy.bind(this,this.state.trade)}>
               <View style={{backgroundColor: UColor.mainColor,borderRadius: 25,}}>
                 <Text style={{ fontSize: 12,color: UColor.arrow,paddingHorizontal: 10,paddingVertical: 2,}}>复制URL</Text>
               </View>
            </Button>
          </View>
        </View>
        <View style={styles.tradehint}>
          <View style={styles.conouttext}>
            <Text style={styles.context}>交  易  号：</Text>
            <Text style={styles.tintext} onPress={this.prot.bind(this, 'transactionId')}>{this.state.trade.transactionId.substring(0, 10) +"..."+ this.state.trade.transactionId.substr(this.state.trade.transactionId.length-10) }</Text>
          </View>
          <View style={styles.conouttext}>
            <Text style={styles.context}> 提     示 ：</Text>
            <Text style={styles.blocktext}>扫码可获取区块交易状态</Text>
          </View>
          <View style={styles.conouttext}>
            <Text style={styles.context}>交易时间：</Text>
            <Text style={styles.blocktext}>{moment(this.state.trade.blockTime).add(8,'hours').format('YYYY/MM/DD HH:mm')}</Text>
          </View>
        </View>
        <View style={{flex: 1,alignItems: 'center',justifyContent: 'flex-end',paddingBottom: 20,}}>
          <Image source={UImage.bottom_log} style={{width:50,height:50}}/>
          <Text style={{ fontSize: 14,color: UColor.arrow,}}>EosToken 专注柚子生态</Text>
        </View>
        </View>
         </ViewShot>
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
 
  header: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: UColor.mainColor,
    borderBottomWidth: 0.5,
  },
  headout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantitytext: {
    fontSize: 30,
    color: UColor.fontColor
  },
  headtext: {
    fontSize: 15,
    color: UColor.arrow,
    paddingTop: 10,
  },
  description: {
    height: 35,
    fontSize: 14,
    color: UColor.tintColor,
  },
  conout: {
    flex: 2,
    flexDirection: "column",
  },
  conouttext: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  context: {
    textAlign: 'justify',
    fontSize: 14,
    color: UColor.arrow,
  },

  tradehint: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 40,
  },
  blocktext: {
    color: UColor.arrow, 
    flex: 1,
    fontSize: 14,
  },
  showytext: {
    color: UColor.showy, 
    flex: 1,
    fontSize: 14,
  },
  tintext: {
    color: UColor.tintColor, 
    flex: 1,
    fontSize: 14,
  },
  codeout: {
    flex:1,
    // marginBottom: 20,
    // marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "column",
  },
  qrcode: {
    backgroundColor: UColor.fontColor,
    padding: 5,
    marginBottom: 10,
  },
});

export default TradeDetails;