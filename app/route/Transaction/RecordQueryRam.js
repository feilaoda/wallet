import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, ImageBackground, ScrollView, RefreshControl } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter' 
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import QRCode from 'react-native-qrcode-svg';
import { EasyToast } from "../../components/Toast"
import moment from 'moment';
var dismissKeyboard = require('dismissKeyboard');
var Dimensions = require('Dimensions')
@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class RecordQueryRam extends React.Component {
  static navigationOptions = {
    title: "搜索交易记录",
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      newramTradeLog: [],
      show: false,
      labelname: '',
      logId: "-1",
      logRefreshing: false,
    }
  }

  //加载地址数据
  componentDidMount() {
    this.setState({logRefreshing: true});
    this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: this.props.navigation.state.params.record, last_id: this.state.logId}, callback: (resp) => {
      try {
        if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
          this.setState({
            newramTradeLog: [],
            show: true
          })
        }else{
          this.setState({
            newramTradeLog: resp.data,
            show: false,
          })
        }
      } catch (error) {
        
      }
      this.processLogId();
      this.setState({logRefreshing: false});

    }});   
    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data.toaccount){
          this.setState({labelname:data.toaccount})
          this.query(data.toaccount);
      }
    }); 
  }

  processLogId(){
    if(this.state.newramTradeLog && (this.state.newramTradeLog.length > 0)){
        this.setState({logId: this.state.newramTradeLog[this.state.newramTradeLog.length - 1]._id});
    }else{
        this.setState({logId: "-1"});
    }
  }

  //检测查询时，是否同一个账户重复查询
  checkIsRepeatQueryByAccount(accountname)
  {
    try {
      if(this.state.newramTradeLog && this.state.newramTradeLog.length > 0){
        if(this.state.newramTradeLog[0].payer == accountname){
           return true;  //重复查询
        }
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  // 根据账号查找交易记录
  query = (labelname) =>{
    if (labelname == ""||labelname == undefined||labelname==null) {
      EasyToast.show('请输入Eos账号');
      return;
    }else{
      if(this.state.logRefreshing){
        return;
      }
      this.setState({logRefreshing: true});

      var repeatquery = this.checkIsRepeatQueryByAccount(labelname);
      var last_id;
      if(repeatquery == false){
        //新的账户名，清除原记录
        this.setState({newramTradeLog: [],logId:-1});
        last_id = -1;
      }else{
        last_id = this.state.logId;
      }

      this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: labelname.toLowerCase(), last_id: last_id}, callback: (resp) => {
        try {
            if(resp.code != '0'){
              this.setState({
                newramTradeLog: [],
                show: true
              })
            }else if((resp.code == '0') && (this.props.ramTradeLog.length == 0)){
                 if(repeatquery){
                   EasyToast.show("没有新交易记录");
                 }else{
                   //没有交易
                  this.setState({
                    newramTradeLog: [],
                    show: true
                  })
                 }
            }else{
              this.setState({
                  newramTradeLog: resp.data,
                  show: false,
              })
            }
          } catch (error) {

          }
          this.processLogId();
          this.setState({logRefreshing: false});

      }});  
    }  
  }

  _empty() {
    this.setState({
      show: false,
      labelname: '',
    });
    this.dismissKeyboardClick();
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  onRefresh(){
    //能进来刷新，列表肯定有交易记录
    if(this.state.logRefreshing){
      return;
    }
    this.setState({logRefreshing: true});
    var accountName = this.state.labelname;
    if (this.state.labelname == ""||this.state.labelname == undefined||this.state.labelname==null) {
      accountName = this.props.navigation.state.params.record;
    }
    
    this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: accountName.toLowerCase(), last_id: this.state.logId}, callback: (resp) => {
      try {
          if(resp.code != '0'){
            this.setState({
              newramTradeLog: [],
              show: true
            })
          }else if((resp.code == '0') && (this.props.ramTradeLog.length == 0)){
            EasyToast.show("没有新交易记录");
          }else{
            this.setState({
                newramTradeLog: resp.data,
                show: false,
            })
          }
        } catch (error) {

        }
        this.processLogId();
        this.setState({logRefreshing: false});

    }}); 
  }

  _openDetails =(ramtransaction) => {
    const { navigate } = this.props.navigation;
    navigate('TradeDetails', {ramtransaction});
  }

  Scan() {
    const { navigate } = this.props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
  }

  render() {
    return (<View style={styles.container}>
      <View style={styles.header}>  
          <View style={styles.inptout} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg} />
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" maxLength={12} 
                  placeholder="输入EOS账号名" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}   
                  />  
              <TouchableOpacity onPress={this.Scan.bind(this,this.state.labelname)}>  
                  <Image source={UImage.account_scan} style={styles.headleftimg} />
              </TouchableOpacity>    
          </View>    
          <TouchableOpacity onPress={this.query.bind(this,this.state.labelname)}>  
              <Text style={styles.canceltext}>查询</Text>
          </TouchableOpacity>   
          <TouchableOpacity   onPress={this._empty.bind(this)}>  
              <Text style={styles.canceltext}>清空</Text>
          </TouchableOpacity> 
      </View>   
      {this.state.show && <View style={styles.nothave}><Text style={styles.copytext}>还没有交易记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        refreshControl={
          <RefreshControl
            refreshing={this.state.logRefreshing}
            onRefresh={() => this.onRefresh()}
            tintColor={UColor.fontColor}
            colors={['#ddd', UColor.tintColor]}
            progressBackgroundColor={UColor.fontColor}
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.state.newramTradeLog == null ? [] : this.state.newramTradeLog)} 
        renderRow={(rowData, sectionID, rowID) => ( 
          <Button onPress={this._openDetails.bind(this,rowData)}>  
            <View style={styles.package}>
              <View style={styles.leftout}>
                <Text style={styles.payertext}>{rowData.payer}</Text>
                <Text style={styles.timetext}>{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text>
              </View>
              <View style={styles.rightout}>
                {rowData.action_name == 'sellram' ? 
                <Text style={styles.selltext}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
                :
                <Text style={styles.buytext}>买 {rowData.eos_qty}</Text>
                }
                <Text style={styles.presentprice}>{(rowData.price == null || rowData.price == '0') ? '' : (rowData.price * 1).toFixed(4)}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
              </View>
            </View>
          </Button>
        )}                   
      />  
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: UColor.secdColor,
        paddingTop: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: ScreenUtil.autoheight(7),
      marginBottom: ScreenUtil.autoheight(5),
      backgroundColor: UColor.mainColor,
    },
    headleftout: {
      paddingLeft: ScreenUtil.autowidth(15),
    },
    headleftimg: {
      width: ScreenUtil.autowidth(18),
      height: ScreenUtil.autowidth(18),
      marginHorizontal: ScreenUtil.autowidth(10),
    },
    inptout: {
      flex: 1,
      height: ScreenUtil.autoheight(30),
      borderRadius: 5,
      marginHorizontal: ScreenUtil.autowidth(15),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'center',
      backgroundColor: UColor.fontColor,
    },
    inpt: {
        flex: 1,
        height: ScreenUtil.autoheight(45),
        fontSize: ScreenUtil.setSpText(14),
        color: '#999999',
    },
    canceltext: {
      color: UColor.fontColor,
      fontSize: ScreenUtil.setSpText(15),
      textAlign: 'center',
      paddingRight: ScreenUtil.autowidth(15),
    },

    btn: {
      flex: 1,
    },
    nothave: {
      height: ScreenUtil.autowidth(84),
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      paddingHorizontal: ScreenUtil.autowidth(20),
      borderRadius: 5,
      margin: ScreenUtil.autowidth(5),
    },
    copytext: {
      fontSize: ScreenUtil.setSpText(16), 
      color: UColor.fontColor
    },

    package: {
      height: ScreenUtil.autoheight(52),
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      paddingHorizontal: ScreenUtil.autowidth(10),
      paddingVertical: ScreenUtil.autoheight(5),
      borderRadius: 5,
      marginHorizontal: ScreenUtil.autowidth(10),
      marginVertical: ScreenUtil.autoheight(5),
    },
    leftout: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
    payertext: {
      fontSize: ScreenUtil.setSpText(15),
      color: UColor.fontColor,
    },
    timetext: {
      fontSize: ScreenUtil.setSpText(15),
      color: UColor.arrow,
    },
   
    rightout: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    selltext: {
      flex: 5,
      fontSize: ScreenUtil.setSpText(15),
      color: '#F25C49',
      textAlign: 'right',
    },
    buytext: {
      flex: 5,
      fontSize: ScreenUtil.setSpText(15),
      color: "#4ed694",
      textAlign: 'right',
    },
    presentprice: {
      fontSize: ScreenUtil.setSpText(14),
      color: UColor.arrow,
      textAlign: 'right',
    }
});
export default RecordQueryRam;