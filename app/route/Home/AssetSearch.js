import React from 'react';
import { connect } from 'react-redux'
import {NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,TouchableOpacity  } from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';

import BaseComponent from "../../components/BaseComponent";
var dismissKeyboard = require('dismissKeyboard');
@connect(({wallet, assets}) => ({...wallet, ...assets}))
class AssetSearch extends BaseComponent {

  static navigationOptions = {
    title: '资产搜索',
    headerStyle:{
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
    }    
  };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ search: this._leftTopClick, cancel:this._rightTopClick  });
    this.state = {
      show:false,
      value: false,
      labelname: '',
      tokenname: '',
      address: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectasset: null,
      newAssetsList: [],
      reveal: true,
    }
  }

  componentDidMount() {
    try {
      EasyShowLD.loadingShow();
      DeviceEventEmitter.emit('stopBalanceTimer', "");
      this.props.dispatch({ type: 'assets/list', payload: { page: 1}, callback: () => {
        EasyShowLD.loadingClose();
      } });
      this.props.dispatch({ type: 'assets/myAssetInfo'});
      DeviceEventEmitter.addListener('updateAssetList', (data) => {
        this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
      });
    } catch (error) {
      EasyShowLD.loadingClose();
    }

  }

  //清空
  _empty = () => {
    this.dismissKeyboardClick();
    this.setState({
      reveal: true,
      labelname: '',
      newAssetsList:[],
    });
  }
  //查询
  _query =(labelname) => {
    this.dismissKeyboardClick();
    if (labelname == "") {
      EasyToast.show('请输入token名称或合约地址');
      return;
    }else{
      let NumberArr = this.props.assetsList;
      for (var i = 0; i < NumberArr.length; i++) {
        if (NumberArr[i].name == labelname.toUpperCase() || NumberArr[i].contractAccount == labelname.toLowerCase()) {
            this.setState({
              newAssetsList:[NumberArr[i]],
              reveal: false,
            });
            break;
        }
      }
      if(i == NumberArr.length){
        EasyToast.show('没有搜索到该token，请尝试手动添加');
        this.setState({
          reveal: true,
        });
      }
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }
  //手动添加
  logout() {
    this._setModalVisible();  
    this.setState({
      tokenname: '',
      address: '',
    });
  }

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  submit() {
    if (this.state.tokenname == "") {
      EasyToast.show('请输入token名称');
      return;
    }
    if (this.state.address == "") {
      EasyToast.show('请输入合约账户');
      return;
    }
    // EasyShowLD.dialogShow();
    this.props.dispatch({ type: 'assets/submitAssetInfoToServer', payload: { contractAccount: this.state.address.toLowerCase(), name: this.state.tokenname.toUpperCase() }, callback: (data) => {
      if(data && data.code=='0'){
        this.setState({
          show: false,
        });
        EasyToast.show('添加成功');
      }else{
        this.setState({
          show: false,
        });
        EasyToast.show(data.msg);
      }
    }});

  }

  addAsset(asset, value) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }
    // EasyShowLD.loadingShow();
    this.props.dispatch({ type: 'assets/addMyAsset', payload: {asset: asset, value: value}, callback: (data) => {
      // EasyShowLD.loadingClose();
    } });
  }

  isMyAsset(rowData){
    if(this.props.myAssets == null){
        return false;
    }
    if(this.state.selectasset != null && this.state.selectasset.name == rowData.name){
      if(this.state.value){
        return true;
      }else{
        return false;
      }
    }
    for(var i = 0; i < this.props.myAssets.length; i++){
        if(this.props.myAssets[i].asset.name == rowData.name ){
            return true;
        } 
    }
    return false;
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

    render() {
        return (
            <View style={styles.container}>
                  <View style={styles.header}>  
                    <View style={styles.inptout} >
                        <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
                        <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" autoCorrect={true}
                            placeholder="输入token名称或合约账户搜索" underlineColorAndroid="transparent" keyboardType="default"
                            onChangeText={(labelname) => this.setState({ labelname })} 
                            />      
                    </View>    
                    <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
                        <Text style={styles.canceltext}>查询</Text>
                    </TouchableOpacity>  
                    <TouchableOpacity   onPress={this._empty.bind(this,this.state.labelname)}>  
                        <Text style={styles.canceltext}>清空</Text>
                    </TouchableOpacity>  
                </View> 
                {this.state.reveal&&<View style={styles.btnout}>
                    <Text style={styles.prompttext}>提示：如果您没有搜索到您要找的Token，可以使用手动添加。</Text>
                    <Button onPress={() => this.logout()}>
                        <View style={styles.btnloginUser}>
                            <Text style={styles.btntext}>手动添加</Text>
                        </View>
                    </Button>
                </View>}
                <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} 
                  dataSource={this.state.dataSource.cloneWithRows(this.state.newAssetsList == null ? [] : this.state.newAssetsList)} 
                  renderRow={(rowData, sectionID, rowID) => (      
                  <View style={styles.listItem}>
                      <View style={styles.listInfo}>
                        <Image source={rowData.icon==null ? UImage.eos : { uri: rowData.icon }} style={{width: 28, height: 28, resizeMode: "cover", overflow:"hidden", borderRadius: 10, marginRight:10,}}/>
                        <View style={styles.scrollView}>
                          <Text style={styles.listInfoTitle}>{rowData.name}</Text>
                        </View>
                        <View style={styles.listInfoRight}>
                          <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor="#ffffff"
                              value={this.isMyAsset(rowData)} onValueChange={(value)=>{
                              this.setState({selectasset: rowData, value: value});
                              this.addAsset(rowData, value);
                          }}/>
                        </View>
                      </View>
                  </View>
                  )}                
                /> 
                <View style={styles.pupuo}>
                  <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <View style={styles.modalStyle}>
                      <View style={styles.subView} >
                        <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                          <Text style={styles.butclose}>×</Text>
                        </Button>
                        <Text style={styles.titleText}>手动添加</Text>
                        <View style={styles.passoutsource}>
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.tokenname}  returnKeyType="next" 
                                selectionColor={UColor.tintColor}  style={styles.inptpass}  placeholderTextColor="#b3b3b3" 
                                placeholder="输入Token名称" underlineColorAndroid="transparent" keyboardType="default"   
                                onChangeText={(tokenname) => this.setState({ tokenname })}/>
                                
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.address}   returnKeyType="go" 
                                selectionColor={UColor.tintColor}  style={styles.inptpass} placeholderTextColor="#b3b3b3" 
                                placeholder="输入合约账户" underlineColorAndroid="transparent"  keyboardType="default"  
                                onChangeText={(address) => this.setState({ address })} maxLength = {12}/>
                        </View>
                        <Button onPress={() => { this.submit() }}>
                          <View style={styles.copyout}>
                            <Text style={styles.copytext}>提交</Text>
                          </View>
                        </Button>
                      </View>
                    </View>
                  </Modal>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      paddingTop: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 7,
      backgroundColor: UColor.mainColor,
    },
    leftout: {
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
      marginHorizontal: 10,
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

    listItem: {
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
   
    listInfo: {
      height: 65,
      flex: 1,
      paddingLeft: 16,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth:1,
      borderTopColor: UColor.secdColor
    },
    scrollView: {
      flex: 1,
    },
    listInfoTitle: {
      color:UColor.fontColor, 
      fontSize:16
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center"
    },

    pupuo: {
      backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
      backgroundColor: UColor.mask,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    // modal上子View的样式  
    subView: {
      marginLeft: 10,
      marginRight: 10,
      backgroundColor: UColor.fontColor,
      alignSelf: 'stretch',
      justifyContent: 'center',
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: UColor.mask,
    },
     // 关闭按钮  
     buttonView: {
      alignItems: 'flex-end',
    },
    butclose: {
      width: 30,
      height: 30,
      marginBottom: 0,
      color: '#CBCBCB',
      fontSize: 28,
    },
    // 标题  
    titleText: {
      marginBottom: 5,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    passoutsource: {
      flexDirection: 'column', 
      alignItems: 'center',
      padding: 10,
      
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: '100%',
        paddingHorizontal: 15,
        marginVertical: 10,
        fontSize: 16,
        backgroundColor: '#f3f3f3',
    },
    copyout: {
      margin: 10, 
      height: 45, 
      borderRadius: 3, 
      backgroundColor: UColor.tintColor, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    copytext: {
      fontSize: 16, 
      color: UColor.fontColor,
    },
  
    tab1:{
      flex:1,
    },
    tab2:{
      flex:1,
      flexDirection: 'column',
    }, 
    
    canceltext: {
      color: UColor.arrow,
      fontSize: 18,
      justifyContent: 'flex-end',
      paddingRight: 10,
    },
    prompttext: {
      fontSize: 15,
      color: UColor.arrow,
      lineHeight: 30,
      padding: 30,
    },
    btnout: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnloginUser: {
      width: 150,
      height: 45,
      backgroundColor: UColor.tintColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5
    },
    btntext: {
      fontSize:17,
      color: UColor.fontColor,
    },
})
export default AssetSearch;