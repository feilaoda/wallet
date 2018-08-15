import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, ImageBackground, ScrollView } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'
import Constants from '../../utils/Constants'
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
var dismissKeyboard = require('dismissKeyboard');
var Dimensions = require('Dimensions')
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
@connect(({wallet, vote}) => ({...wallet, ...vote}))
class MortgageRecord extends React.Component {

  static navigationOptions = {
    title: "抵押记录",
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
      delegateLoglist: [],
      show: false,
      password: "",
      labelname: '',
    }
  }

  //加载地址数据
  componentDidMount() {
    this.getAccountInfo();
    this.props.dispatch({type: 'wallet/info',payload: { address: "1111"}});
    DeviceEventEmitter.addListener('scan_result', (data) => {
      if(data.toaccount){
          this.setState({labelname:data.toaccount})
          this._query(data.toaccount);
      }
    }); 
  }

  getAccountInfo() {
    EasyShowLD.loadingShow();
    this.props.dispatch({
      type: 'vote/getDelegateLoglist',
      payload: {account_name: this.props.navigation.state.params.account_name},
      callback: (resp) => {
        EasyShowLD.loadingClose();
        if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
          this.setState({show: true, delegateLoglist: []});
        }else{
          this.setState({show: false, delegateLoglist: resp.data.rows});
        }
      }
  });
  }

  _empty() {
    this.setState({
      show: false,
      labelname: '',
    });
    this.dismissKeyboardClick();
  }

  _query =(labelname) => {
    if (labelname == ""||labelname == undefined||labelname==null) {
      EasyToast.show('请输入Eos账号');
      return;
    }else{
      EasyShowLD.loadingShow();
      this.dismissKeyboardClick();
      this.props.dispatch({ type: 'vote/getDelegateLoglist', payload: {account_name: labelname},
        callback: (resp) => {
          EasyShowLD.loadingClose();
          if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
            this.setState({show: true, delegateLoglist: []});
          }else{
            this.setState({show: false, delegateLoglist: resp.data.rows});
          }
        }
      });
    }
  }

  _setModalVisible(redeem) {
    this. dismissKeyboardClick();
    EasyShowLD.dialogShow("您确认要赎回这笔抵押吗？", (
        <View style={styles.warningout}>
            <Image source={UImage.warning_h} style={styles.imgBtn} />
            <Text style={styles.headtitle}>建议保留少量抵押，否则可能影响您的账号正常使用！赎回的EOS将于3天后，返还到您的账户。</Text>
        </View>
    ), "执意赎回", "取消", () => {
      this.undelegateb(redeem);
    }, () => { EasyShowLD.dialogClose() });
  }

  //赎回
  undelegateb = (redeem) => { 
    const view =
    <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go"  
            selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
            placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
        {/* <Text style={styles.inptpasstext}>提示：赎回 {Number(redeem.cpu_weight.replace("EOS", ""))+Number(redeem.net_weight.replace("EOS", ""))} EOS</Text> */}
    </View>
    EasyShowLD.dialogShow("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyShowLD.loadingShow();
                // 解除抵押
                Eos.undelegate(plaintext_privateKey, redeem.from, redeem.to, formatEosQua(redeem.cpu_weight), formatEosQua(redeem.net_weight), (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("赎回成功");
                    }else{    
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("赎回失败");
                            }
                        }else{
                            EasyToast.show("赎回失败");
                        }
                    }
                })
            } else {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyShowLD.loadingClose();
            EasyToast.show('未知异常');
        }
        // EasyShowLD.dialogClose();
    }, () => { EasyShowLD.dialogClose() });
  };

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  Scan() {
    const { navigate } = this.props.navigation;
    navigate('BarCode', {isTurnOut:true,coinType:"EOS"});
  }

  render() {
    return (<View style={styles.container}>
      <View style={styles.header}>  
          <View style={styles.inptout} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" maxLength={12} 
                  placeholder="输入Eos账号(查询他人抵押信息)" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}  numberOfLines={1} 
                  />    
              <TouchableOpacity onPress={this.Scan.bind(this)}>  
                  <Image source={UImage.account_scan} style={styles.headleftimg} />
              </TouchableOpacity>  
          </View>    
          <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
              <Text style={styles.canceltext}>查询</Text>
          </TouchableOpacity>   
          <TouchableOpacity   onPress={this._empty.bind(this)}>  
              <Text style={styles.canceltext}>清空</Text>
          </TouchableOpacity>  
      </View>   
      {this.state.show && <View style={styles.nothave}><Text style={styles.copytext}>还没有抵押记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        dataSource={this.state.dataSource.cloneWithRows(this.state.delegateLoglist == null ? [] : this.state.delegateLoglist)} 
        renderRow={(rowData, sectionID, rowID) => (   
            <View style={styles.outsource}>
              <View style={styles.leftout}>
                <Button onPress={this._setModalVisible.bind(this,rowData)} style={{flex: 1,}}>
                    <View >
                        <Text style={{fontSize: 12, color: UColor.tintColor,}}>一键赎回</Text>
                    </View>
                </Button> 
                <View style={{flex: 1,justifyContent: 'space-between',}}>
                  <Text style={styles.fromtotext}>{rowData.to}</Text>
                  <Text style={styles.Receivercpu}>Receiver</Text>
                </View>
              </View>
              <View style={styles.rightout}>
                  <Text style={styles.fromtotext}>{rowData.net_weight}</Text>
                  <Text style={styles.payernet}>Net bandwidth</Text>
                  <Text style={styles.fromtotext}>{rowData.cpu_weight}</Text>
                  <Text style={styles.Receivercpu}>CPU bandwidth</Text>
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
      backgroundColor: UColor.mainColor,
      marginBottom: 5,
    },
    headleftout: {
      paddingLeft: 15
    },
    headleftimg: {
      width: 18,
      height: 18,
      marginHorizontal: 10,
    },
    inptout: {
      flex: 1,
      height: 30,
      borderRadius: 5,
      marginHorizontal: 10,
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
      fontSize: 13,
      textAlign: 'center',
      paddingRight: 15,
    },

    btn: {
      flex: 1,
    },
    nothave: {
      height: 110,
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
    outsource: {
      margin: 5,
      height: 90,
      borderRadius: 5,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      backgroundColor: UColor.mainColor,
    },
    leftout:{
      flex: 1, 
      alignItems: "flex-start",
    },
    rightout: {
      flex: 1, 
      alignItems: "flex-end", 
      justifyContent: 'space-between',
    },
    fromtotext: {
      fontSize: 12,
      color: UColor.fontColor,
    },
    payernet: {
      fontSize: 12,
      color: UColor.arrow,
    },
    Receivercpu: {
      fontSize: 12,
      color: UColor.arrow,
    },

    warningout: {
      width: maxWidth-80,
      flexDirection: "row",
      alignItems: 'center', 
      // paddingHorizontal: 5,
      // paddingVertical: 5,
      borderColor: UColor.showy,
      borderWidth: 1,
      borderRadius: 5,
    },
    imgBtn: {
      width: 30,
      height: 30,
      margin:5,
    },
    headtitle: {
      flex: 1,
      color: UColor.showy,
      fontSize: 14,
      lineHeight: 25,
      paddingLeft: 10,
    },
   
   
      // 密码输入框
    passoutsource: {
      flexDirection: 'column', 
      alignItems: 'center'
    },
    inptpass: {
      color: UColor.tintColor,
      height: 45,
      width: maxWidth-100,
      paddingBottom: 5,
      fontSize: 16,
      backgroundColor: UColor.fontColor,
      borderBottomColor: UColor.baseline,
      borderBottomWidth: 1,
    },
    inptpasstext: {
      fontSize: 14,
      color: '#808080',
      lineHeight: 25,
      marginTop: 5,
    },


    subViewBackup: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      width: maxWidth-20,
      height: 20,
      paddingHorizontal: 5,
    },
    buttonView2: {
      width: 30,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttontext: {
      width: 40,
      color: '#CBCBCB',
      fontSize: 28,
      textAlign: 'right',
    },

    contentText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingBottom: 20,
    },
    buttonView: {
      alignItems: 'flex-end',
    },

    deleteout: {
      height: 50,
      marginHorizontal: 60,
      marginVertical: 15,
      borderRadius: 6,
      backgroundColor: UColor.tintColor,
      justifyContent: 'center',
      alignItems: 'center'
    },
    deletetext: {
      fontSize: 16,
    },
    
});
export default MortgageRecord;