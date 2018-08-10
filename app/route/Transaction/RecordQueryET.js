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
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import QRCode from 'react-native-qrcode-svg';
import { EasyToast } from "../../components/Toast"
import moment from 'moment';
var dismissKeyboard = require('dismissKeyboard');
var Dimensions = require('Dimensions')
@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class RecordQueryET extends React.Component {
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
      newetTradeLog: [],
      show: false,
      labelname: '',
      logId: "-1",
      logRefreshing: false,
    }
  }

  //加载地址数据
  componentDidMount() {
    this.setState({logRefreshing: true});
    this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: this.props.navigation.state.params.record,"pageCount":"2", last_id: this.state.logId}, callback: (resp) => {
      try {
        if(resp.code != '0' || ((resp.code == '0') && (this.props.etTradeLog.length == 0))){
          this.setState({
            newetTradeLog: [],
            show: true
          })
        }else{
          this.setState({
            newetTradeLog: resp.data,
            show: false,
          })
        }
      } catch (error) {
        
      }
      this.processLogId();
      this.setState({logRefreshing: false});

    }});    
  }

  processLogId(){
    if(this.state.newetTradeLog && (this.state.newetTradeLog.length > 0)){
        this.setState({logId: this.state.newetTradeLog[this.state.newetTradeLog.length - 1]._id});
    }else{
        this.setState({logId: "-1"});
    }
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
      this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: labelname.toLowerCase(),"pageCount":"2", last_id: this.state.logId}, callback: (resp) => {
        try {
            if(resp.code != '0' || ((resp.code == '0') && (this.props.etTradeLog.length == 0))){
              this.setState({
                newetTradeLog: [],
                show: true
              })
            }else{
              this.setState({
                  newetTradeLog: resp.data,
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
    if(this.state.logRefreshing){
      return;
    }
    this.setState({logRefreshing: true});
    var accountName = this.state.labelname;
    if (this.state.labelname == ""||this.state.labelname == undefined||this.state.labelname==null) {
      accountName = this.props.navigation.state.params.record;
    }
    this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: accountName.toLowerCase(),"pageCount":"2", last_id: "-1"}, callback: (resp) => {
      try {
          if(resp.code != '0' || ((resp.code == '0') && (this.props.etTradeLog.length == 0))){
            this.setState({
              newetTradeLog: [],
              show: true
            })
          }else{
            this.setState({
                newetTradeLog: resp.data,
                show: false,
            })
          }
        } catch (error) {

        }
        this.processLogId();
        this.setState({logRefreshing: false});

    }}); 
  }

  onEndReached(){
    if(this.state.logRefreshing || this.state.logId == "-1"){
      return;
    }
    this.setState({logRefreshing: true});
    var accountName = this.state.labelname;
    if (this.state.labelname == ""||this.state.labelname == undefined||this.state.labelname==null) {
      accountName = this.props.navigation.state.params.record;
    }
    this.props.dispatch({type: 'transaction/getETTradeLogByAccount',payload: {code:this.state.selectcode,account_name: accountName.toLowerCase(),"pageCount":"2", last_id: this.state.logId}, callback: (resp) => {
      try {
          if(resp.code != '0' || ((resp.code == '0') && (this.props.etTradeLog.length == 0))){
            this.setState({
              newetTradeLog: [],
              show: true
            })
          }else{
            this.setState({
                newetTradeLog: resp.data,
                show: false,
            })
          }
        } catch (error) {

        }
        this.processLogId();
        this.setState({logRefreshing: false});

    }}); 
  }

  render() {
    return (<View style={styles.container}>
      <View style={styles.header}>  
          <View style={styles.inptout} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" maxLength={12} 
                  placeholder="输入EOS账号名" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}   
                  />      
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
        // onEndReached={() => this.onEndReached()}
        refreshControl={
          <RefreshControl
            refreshing={this.state.logRefreshing}
            onRefresh={() => this.onRefresh()}
            tintColor="#fff"
            colors={['#ddd', UColor.tintColor]}
            progressBackgroundColor="#ffffff"
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.state.newetTradeLog == null ? [] : this.state.newetTradeLog)} 
        renderRow={(rowData, sectionID, rowID) => (   
          <View style={styles.package}>
            <View style={styles.leftout}>
              <Text style={styles.payertext}>{rowData.payer}</Text>
              <Text style={styles.timetext}>{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text>
            </View>
            <View style={styles.rightout}>
              {rowData.action_name == 'selltoken' ? 
              <Text style={styles.selltext}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
              :
              <Text style={styles.buytext}>买 {rowData.eos_qty}</Text>
              }
              <Text style={styles.presentprice}>{(rowData.price == null || rowData.price == '0') ? '' : rowData.price}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
            </View>
          </View>
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
      paddingVertical: 7,
      marginBottom: 5,
      backgroundColor: UColor.mainColor,
    },
    headleftout: {
      paddingLeft: 15
    },
    headleftimg: {
      width: 18,
      height: 18,
      marginRight: 15,
    },
    inptout: {
      flex: 1,
      height: 30,
      borderRadius: 5,
      marginHorizontal: 15,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'center',
      backgroundColor: UColor.fontColor,
    },
    inpt: {
        flex: 1,
        height: 45,
        fontSize: 14,
        color: '#999999',
    },
    canceltext: {
      color: UColor.fontColor,
      fontSize: 15,
      textAlign: 'center',
      paddingRight: 15,
    },

    btn: {
      flex: 1,
    },
    nothave: {
      height: Platform.OS == 'ios' ? 84.5 : 65,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 5,
      margin: 5,
    },
    copytext: {
      fontSize: 16, 
      color: UColor.fontColor
    },

    package: {
      height: 52,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
      marginHorizontal: 10,
      marginVertical: 5,
    },
    leftout: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
    payertext: {
      fontSize: 15,
      color: UColor.fontColor,
    },
    timetext: {
      fontSize: 15,
      color: UColor.arrow,
    },
   
    rightout: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    selltext: {
      flex: 5,
      fontSize: 15,
      color: '#F25C49',
      textAlign: 'right',
    },
    buytext: {
      flex: 5,
      fontSize: 15,
      color: "#4ed694",
      textAlign: 'right',
    },
    presentprice: {
      fontSize: 14,
      color: UColor.arrow,
      textAlign: 'right',
    }
});
export default RecordQueryET;