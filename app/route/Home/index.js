import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, ListView,NativeModules, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground, ScrollView, RefreshControl,Linking, } from 'react-native';
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
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyToast } from "../../components/Toast"
import { EasyShowLD } from '../../components/EasyShow'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Constants from '../../utils/Constants'
import { Eos } from "react-native-eosjs";

@connect(({ wallet, assets }) => ({ ...wallet, ...assets }))
class Home extends React.Component {

  static navigationOptions = {
    title: '钱包',
    header: null,
    headerStyle: {
      paddingTop: ScreenUtil.autoheight(20),
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      status: 'rgba(255, 255, 255,0)',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      fadeAnim: new Animated.Value(15),  //设置初始值
      modal: false,
      balance: '0',
      account: 'xxxx',
      show: false,
      invalidWalletList: [],
      totalBalance: '0.00',
      increase:0,
      Invalid: false,
      arr1: 0,
      isChecked: true,
      isEye: false,
      assetRefreshing: false,
    };
  }

  componentDidMount() {
    //加载地址数据
    this.props.dispatch({type:'assets/getReveal',callback:(reveal)=>{ this.setState({isEye:reveal.reveal,});}});
    this.props.dispatch({ type: 'wallet/updateInvalidState', payload: {Invalid: false}});
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.setState({assetRefreshing: true});
      this.getDefaultWalletEosBalance( () => {
        this.setState({assetRefreshing: false});
      });
      this.getAllWalletEosBalance();
      this.getIncrease();
      this.getMyAssetsInfo();
    }});
    this.props.dispatch({ type: 'wallet/walletList' });
    this.props.dispatch({ type: 'wallet/invalidWalletList',  callback: (invalidWalletList) => {
      if(invalidWalletList != null){
        this.setState({ 
          Invalid: true,
          arr1 : invalidWalletList.length,
          invalidWalletList : invalidWalletList
         })
      }
    }});

    Animated.timing(
      this.state.fadeAnim,  //初始值
      {
        toValue: 22,            //结束值
        duration: 2000,        //动画时间
        easing: Easing.linear,
      },
    ).start();               //开始
    DeviceEventEmitter.addListener('wallet_info', (data) => {
      this.getDefaultWalletEosBalance();
      this.getAllWalletEosBalance();
      this.getAssetBalance();    
    });
    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.getDefaultWalletEosBalance(); // 默认钱包余额
        this.getAllWalletEosBalance();
        this.getAssetBalance();  
      } });
    });

    this.listener = RCTDeviceEventEmitter.addListener('createWallet',(value)=>{  
      this.createWallet();  
    });  

    DeviceEventEmitter.addListener('eos_increase', (data) => {
      if(data == null || data == undefined){
        reurn;
      }
      this.setState({increase: data});
    });

    DeviceEventEmitter.addListener('eos_balance', (data) => {
      if(this.props.walletList == null || this.props.walletList.length == 0){
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
      }
      this.calTotalBalance();
    });

    DeviceEventEmitter.addListener('updateMyAssets', (data) => {
      this.getAssetBalance();
    });

    DeviceEventEmitter.addListener('updateMyAssetsBalance', (data) => {
      this.calTotalBalance();
    });

    DeviceEventEmitter.addListener('updateMyAssetsPrice', (data) => {
      this.calTotalBalance();
    });

    DeviceEventEmitter.addListener('refreshWalletInfo', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.getDefaultWalletEosBalance(); // 默认钱包余额
        this.getAllWalletEosBalance();
        this.getAssetBalance();  
        this.getIncrease();
      } });
    });
  }

  componentWillUnmount(){
    this.listener.remove();  
  }

  getMyAssetsInfo(){
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({ type: 'assets/myAssetInfo', payload: { page: 1, isInit: true}, callback: (myAssets) => {
      this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
        this.getAssetBalance();    
      }});
    }});
  }

  calTotalBalance(){
    if(this.props.myAssets == null){
      return;
    }
    var sum = 0;
    for(var i = 0; i < this.props.myAssets.length; i++){
        if(this.props.myAssets[i].balance == null || this.props.myAssets[i].asset.value == null){
          continue;
        }
        var total = this.props.myAssets[i].balance.replace(this.props.myAssets[i].asset.name, "") * this.props.myAssets[i].asset.value;
        sum = sum + total;
    }
    this.setState({totalBalance: sum.toFixed(2)});
  }

  adjustTotalBalance(obj){
    var dispassert;
    // obj = '12345678911.01';
    if(obj >= 10000.00){
      dispassert = (obj/10000.00).toFixed(2);
      dispassert += '万';
    }else{
      dispassert = obj;
    }
    if(dispassert == null){
      return this.state.totalBalance;
    }
    return dispassert;
  }

  getIncrease(){
    this.props.dispatch({ type: 'sticker/listincrease', payload: { type: 0}, callback: (data) => { 
        if(data == undefined || data == null){
          reurn;
        }
        if(data[0].increase){
          this.setState({increase: data[0].increase});
        }
    } });
  }
  
  getDefaultWalletEosBalance(callback) { 
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      if(callback) callback();
      return;
    }

    this.props.dispatch({
      type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name , symbol: 'EOS' }, callback: () => {
        if(callback) callback();
      }
    });
  }

  getAllWalletEosBalance(){
    if(this.props.walletList == null){
      return;
    }

    for(var i = 0; i < this.props.walletList.length; i++) {
      if (this.props.walletList[i] != null && this.props.walletList[i].name != null && (this.props.walletList[i].isactived && this.props.walletList[i].hasOwnProperty('isactived'))) {
        this.props.dispatch({
          type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.walletList[i].name, symbol: 'EOS' }
        })
  
      }
    }
  }

  getAssetBalance(){
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
      return;
    }

    this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
      EasyShowLD.loadingClose();
    }});
  }

  onRequestClose() {
    this.setState({
      modal: false
    });
  }

  // 显示/隐藏   
  _setModalInvalid() {
    this.props.dispatch({ type: 'wallet/updateInvalidState', payload: {Invalid: false}});
  }

 delInvalidWallet() {
    if(this.props.invalidWalletList == null || this.props.invalidWalletList.length == 0){
      return;
    }
    var arr = [];
    for(var i = 0; i < this.props.invalidWalletList.length; i++){ 
        if(this.props.invalidWalletList[i].isChecked == true){
          arr.push(this.props.invalidWalletList[i]);
        }     
    }
    this.props.dispatch({ type: 'wallet/delWalletList', payload: { walletList: arr } });
    EasyToast.show("删除无效账号成功！");
    this._setModalInvalid(); 
  }


  onPress(key, data = {}) {
    const { navigate } = this.props.navigation;
    if(this.props.defaultWallet != null && this.props.defaultWallet.name != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
        this.WalletDetail(this.props.defaultWallet);
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });

      return;
    }

    if (key == 'Receivables') {
      AnalyticsUtil.onEvent('Receipt_code');
      if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && (this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
        // this._setModalVisible();
        navigate('TurnIn', {});
      } else {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
      }
    }else if (key == 'functionsMore') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('FunctionsMore', {data, balance: this.state.balance,account_name:(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name});
    }else if (key == 'transfer') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('TurnOut', { coins:'EOS', balance: this.state.balance });
    }else if (key == 'Resources') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('Resources', {account_name:(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name});
    }else if(key == 'addAssets'){
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });  
        return;
      }
      navigate('AddAssets', {});
    } else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  scan() {
    if(this.props.defaultWallet != null && this.props.defaultWallet.name != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
        this.WalletDetail(this.props.defaultWallet);
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });

      return;
    }
    AnalyticsUtil.onEvent('Scavenging_transfer');
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived')) {
      const { navigate } = this.props.navigation;
      navigate('BarCode', {});
    } else {
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
    }
  }

  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  copy = () => {
    let address;
    if (this.props.defaultWallet != null && this.props.defaultWallet.account != null && (this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
      address = this.props.defaultWallet.account;
    } else {
      address = this.state.account;
    }
    this._setModalVisible();
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    navigate('WalletManage', {});
    this.setState({
      modal: false
    });
    this._disableTipVisible();
  }
  importWallet() {
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey', {});
    this.setState({
      modal: false
    });
    this._disableTipVisible();
  }

  changeWallet(data) {
    this.setState({
      modal: false
    });
    if(!data.isactived || !data.hasOwnProperty('isactived')){
      EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
        this.WalletDetail(data);
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
    }else {
      const { dispatch } = this.props;
      try {
        this.setState({assetRefreshing: true});
        this.props.dispatch({ type: 'wallet/changeWallet', payload: { data }, callback: () => {
          this.props.dispatch({ type: 'assets/clearBalance', payload: {}, callback: () => {
            this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
              this.setState({assetRefreshing: false});
            }});
          }});
        }});
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
      } catch (error) {
        this.setState({assetRefreshing: false});
      }

    }
  }

  assetInfo(asset) {

    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyShowLD.dialogShow("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyShowLD.dialogClose()
      }, () => { EasyShowLD.dialogClose() });
      return;
    }else {
      if(!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')){
        EasyShowLD.dialogShow("温馨提示", "您的账号未激活", "激活", "取消", () => {
          this.WalletDetail(this.props.defaultWallet);
          EasyShowLD.dialogClose()
        }, () => { EasyShowLD.dialogClose() });
        return;
      }
    }
    const { navigate } = this.props.navigation;
    navigate('AssetInfo', { asset, account: this.props.defaultWallet.name });
  }

  WalletDetail(data) {
    const { navigate } = this.props.navigation;
    navigate('WalletDetail', { data,balance:this.props.myAssets[0].balance,});
    this.setState({
      modal: false
    });
    this._disableTipVisible();
  }

  Establish() {
    this._disableTipVisible();
    const { navigate } = this.props.navigation;
    navigate('CreateWallet', {entry: "wallet_home"});
  }
  
  Import() {
    this._disableTipVisible();
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey', {});
  }

  getTodayIncrease()
  {
    var ret ;
    if(this.props.defaultWallet != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))){
      ret = '+0.00';  //未激活直接返回
    }else{
      ret = (this.state.totalBalance == null || this.state.increase == null) ? '0.00' : ((this.state.increase>=0? "+" : "") +(((this.state.totalBalance * this.state.increase) / 100).toFixed(2)))
    }
    return ret;
  }

  copyname(wallet) {
    Clipboard.setString(wallet.name);
    EasyToast.show('账号复制成功');
  }

  onPressReveal() {
    this.props.dispatch({type:'assets/changeReveal',callback:(reveal)=>{
      this.setState({
        isEye:reveal.reveal,
      });
    }});
  }

  onRefresh(){
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
      return;
    }

    this.setState({assetRefreshing: true});
    this.props.dispatch({ type: 'assets/fetchMyAssetsFromNet', payload: { accountName: this.props.defaultWallet.name}, callback: () => {
      this.props.dispatch({ type: 'assets/getBalance', payload: { accountName: this.props.defaultWallet.name, myAssets: this.props.myAssets}, callback: () => {
        this.setState({assetRefreshing: false});
      }});
    }});

    this.getDefaultWalletEosBalance(); // 默认钱包余额
  }

  isTipShow() {
    if (Platform.OS == 'ios') {
      if (this.props.defaultWallet != null && this.props.defaultWallet.isBackups==false) {
        return true;
      }
    }
    return false;
  }

    // 显示/隐藏 tipIOS  
    _disableTipVisible() {
      this.props.dispatch({ type: 'wallet/updateTipState', payload: {tipFlagIOS: false}});
    }
  

  WalletDetailBackup(data) {
    const { navigate } = this.props.navigation;
    navigate('WalletDetail', { data,balance:this.props.myAssets[0].balance,});
    this._disableTipVisible();
  }

  openSystemSetting(){
    // console.log("go to set net!")
    if (Platform.OS == 'ios') {
      Linking.openURL('app-settings:')
        .catch(err => console.log('error', err))
    } else {
      NativeModules.OpenSettings.openNetworkSettings(data => {
        console.log('call back data', data)
      })
    }

  }

  render() {

  if(this.props.guide){
    return (
      <View style={styles.container}>
        
        <ScrollView>
            <Image source={UImage.guide} style={styles.imgTop} resizeMode="contain"/>
            <Button onPress={() => this.Establish()}>
              <View style={styles.btnestablish}>
                  <Text style={styles.btntext}>创建账号</Text>
              </View>
            </Button>
            <Button onPress={this.Import.bind(this)}>
              <View style={styles.btnimport}>
                  <Text style={styles.btntext}>导入账号</Text>
              </View>
            </Button>
        </ScrollView>
      </View>
    )
  }else{
    return (
      <View style={styles.container}>
        
        <View>
          <View style={styles.topbtn}>
            <Button onPress={() => this.scan()}>
              <Image source={UImage.scan} style={styles.imgBtn} />
            </Button>
            <Text style={styles.toptext}>EOS资产</Text>
            <Button onPress={() => this.setState({ modal: !this.state.modal })}>
              <Image source={UImage.wallet_h} style={styles.imgBtn} />
            </Button>
          </View>

        {Constants.netTimeoutFlag==true &&
          <Button onPress={this.openSystemSetting.bind(this)}>
            <View style={styles.systemSettingTip}>
                <Text style={styles.systemSettingText}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                <Ionicons style={styles.systemSettingArrow} name="ios-arrow-forward-outline" size={20} />
            </View>
          </Button>}

          <ImageBackground style={styles.bgout} source={UImage.home_bg} resizeMode="cover">
            <View style={styles.head}>
              <Button onPress={this.onPress.bind(this, 'Receivables')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                  <Image source={UImage.qr} style={styles.imgBtn} />
                  <Text style={styles.headbtntext}>收币</Text>
                </View>
              </Button>
              <Button onPress={this.onPress.bind(this, 'transfer')} style={styles.headbtn}>
                <View style={styles.headbtnout}>
                  <Image source={UImage.transfer} style={styles.imgBtn} />
                  <Text style={styles.headbtntext}>转账</Text>
                </View>
              </Button>
              <Button  onPress={this.onPress.bind(this, 'Resources')}  style={styles.headbtn}>
                <View style={styles.headbtnout}>
                  <Image source={UImage.resources} style={styles.imgBtn} />
                  <Text style={styles.headbtntext}>资源管理</Text>
                </View>
              </Button>
              <Button  onPress={this.onPress.bind(this, 'functionsMore')}  style={styles.headbtn}>
                <View style={styles.headbtnout}>
                  <Image source={UImage.more} style={styles.imgBtn} />
                  <Text style={styles.headbtntext}>更多</Text>
                </View>
              </Button>
            </View>
          </ImageBackground>
          <View style={styles.addto}>
              <View style={styles.addout}>
                  <View style={styles.topout} >
                    <Button onPress={this.copyname.bind(this,this.props.defaultWallet)} >
                        <Text style={styles.addtotext}>{(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name}</Text>
                    </Button>
                    <Text style={styles.addtotext}> 总资产</Text>
                    <TouchableOpacity onPress={this.onPressReveal.bind(this,this.state.isEye)}>
                        <Image source={this.state.isEye ? UImage.reveal_wallet : UImage.reveal_h_wallet} style={styles.imgTeOy}/>
                    </TouchableOpacity>
                    {(this.props.defaultWallet != null && (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) ? <View style={styles.notactivedout}><Text style={styles.notactived} onPress={this.WalletDetail.bind(this,this.props.defaultWallet)}>未激活</Text></View>:((this.props.defaultWallet == null || this.props.defaultWallet.name == null || (this.props.defaultWallet != null &&this.props.defaultWallet.isBackups)) ? null :  <View style={styles.stopoutBackupsout}><Text style={styles.stopoutBackups} onPress={this.WalletDetail.bind(this,this.props.defaultWallet)}>未备份</Text></View>) }   
                  </View>
                <View style={styles.addtoout}>
                  <Text style={styles.addtoouttext}>≈{this.state.isEye ? ((this.props.defaultWallet == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) ? '0.00' : this.adjustTotalBalance(this.state.totalBalance)) : '****'}(￥)</Text>
                  <Text style={(this.state.increase>=0 || this.state.totalBalance == "0.00")?styles.incdo:styles.incup}>今日 {this.state.isEye ? this.getTodayIncrease() : '****'}</Text>
                </View>
              </View>
              <Button onPress={this.onPress.bind(this, 'addAssets')} style={styles.addtobtn}>  
                <View style={styles.addbtnout}>             
                  <Image source={UImage.add} style={styles.imgBtn} />
                  <Text style={styles.addbtnimg}>添加资产</Text>  
                </View>               
              </Button>
          </View>
        </View>   
        <ListView initialListSize={1} enableEmptySections={true} 
          refreshControl={
            <RefreshControl
              refreshing={this.state.assetRefreshing}
              onRefresh={() => this.onRefresh()}
              tintColor={UColor.fontColor}
              colors={[UColor.lightgray, UColor.tintColor]}
              progressBackgroundColor={UColor.fontColor}
            />
          }
          dataSource={this.state.dataSource.cloneWithRows(this.props.myAssets == null ? [] : this.props.myAssets)} 
          renderRow={(rowData, sectionID, rowID) => (      
            <View style={styles.listItem}>
              <Button onPress={this.assetInfo.bind(this, rowData)}>
                <View style={styles.row}>
                  <View style={styles.lefts}>
                    <Image source={rowData.asset.icon==null ? UImage.eos : { uri: rowData.asset.icon }} style={styles.leftimg} />
                    <Text style={styles.lefttext}>{rowData.asset.name}</Text>
                  </View>
                  <View style={styles.rights}>
                    <View style={styles.rightout}>
                        <Text style={styles.rightbalance}>{this.state.isEye ? (rowData.balance==null || rowData.balance=="" || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? "0.0000" : rowData.balance.replace(rowData.asset.name, "") : '****'}</Text>
                        <Text style={styles.rightmarket}>≈{this.state.isEye ? (rowData.balance==null || rowData.balance=="" || rowData.asset.value == null || rowData.asset.value == "" || (!this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')))? "0.00" : (rowData.balance.replace(rowData.asset.name, "")*rowData.asset.value).toFixed(2) : '****'}（￥）</Text>
                    </View>
                  </View>
                </View>
              </Button>
            </View>
          )}                
         />  

        <Modal style={styles.touchableouts} animationType={'none'} transparent={true}  visible={this.props.tipFlagIOS==false?false:this.isTipShow()  } onRequestClose={()=>{}}>
            <TouchableOpacity style={styles.pupuoBackup} activeOpacity={1.0}>
              <View style={{ width: ScreenWidth-20, backgroundColor: UColor.fontColor, borderRadius: 5, position: 'absolute', }}>
                <View style={styles.subViewBackup}> 
                  <Button onPress={this._disableTipVisible.bind(this) } style={styles.buttonView2}>
                      <Ionicons style={{ color: UColor.baseline}} name="ios-close-outline" size={30} />
                  </Button>
                </View>
                <Text style={styles.contentText}>IOS用户重要提示</Text>
                <View style={styles.warningout}>
                    <Image source={UImage.warning_h} style={styles.imgBtn} />
                    <Text style={styles.headtitle}>亲爱的eostoken用户：由于App Store平台自身存在证书授权过期问题导致app无法打开的情况发生，造成数据丢失。当前系统检测到您尚未备份钱包，为了避免资产损失，请您及时备份。</Text>
                </View>
                <Button onPress={this.WalletDetailBackup.bind(this,this.props.defaultWallet)}>
                    <View style={styles.deleteout}>
                        <Text style={styles.deletetext}>立即备份</Text>
                    </View>
                </Button> 
              </View> 
            </TouchableOpacity>
        </Modal>

        <Modal style={styles.touchableouts} animationType={'none'} transparent={true} onRequestClose={() => { this.onRequestClose() }} visible={this.state.modal}>
          <TouchableOpacity onPress={() => this.setState({ modal: false })} style={styles.touchable} activeOpacity={1.0}>
            <TouchableOpacity style={styles.touchable} activeOpacity={1.0}>
              <View style={styles.touchableout}>
                <ListView initialListSize={5} style={styles.touchablelist}
                  renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
                  enableEmptySections={true} dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
                  renderRow={(rowData) => (
                    <Button onPress={this.changeWallet.bind(this, rowData)}>
                      <View style={styles.walletlist} backgroundColor={(this.props.defaultWallet == null || this.props.defaultWallet.name == rowData.account) && UColor.inash}>
                        <View style={styles.topout}>
                          <Text style={styles.outname}>{rowData.name}</Text>
                          {(!rowData.isactived || !rowData.hasOwnProperty('isactived')) ? <View style={styles.notactivedout}><Text style={styles.notactived} onPress={this.WalletDetail.bind(this, rowData)}>未激活</Text></View>:(rowData.isBackups ? null :  <View style={styles.stopoutBackupsout}><Text style={styles.stopoutBackups} onPress={this.WalletDetail.bind(this, rowData)}>未备份</Text></View>)}  
                        </View>
                        <Text style={styles.walletaccount} numberOfLines={1} ellipsizeMode='middle'>{this.state.isEye ? (rowData.isactived && rowData.balance != null && rowData.balance != ""? rowData.balance : '0.0000') : '****'} EOS</Text>
                      </View>
                    </Button> 
                  )}
                />
                <View style={styles.ebhbtnout}>
                  <Button onPress={() => this.createWallet()} style={styles.btnout}>
                    <View style={styles.establishout}>
                      <Image source={UImage.wallet_1} style={styles.establishimg} />
                      <Text style={styles.establishtext}>创建钱包</Text>
                    </View>
                  </Button>
                  <Button onPress={() => this.createWallet()} style={styles.btnout}>
                    <View style={styles.establishout}>
                      <Image source={UImage.xin_import} style={styles.establishimg} />
                      <Text style={styles.establishtext}>导入钱包</Text>
                    </View>
                  </Button>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
         <Modal style={styles.touchableouts} animationType={'slide'} transparent={true}  visible={this.props.Invalid} onRequestClose={()=>{}}>
            <TouchableOpacity style={styles.pupuo} activeOpacity={1.0}>
              <View style={styles.modalStyle}>
                <View style={styles.subView}> 
                  <Text style={styles.titleText}/>
                  <Text style={styles.contentText}>无效账户删除提示</Text>
                  <Button onPress={this._setModalInvalid.bind(this)}>
                    <Text style={styles.titleText}>×</Text>
                  </Button>
                </View>
                <Text style={styles.prompt}>警告：系统检测到您有无效账号残留，为了避免误转账至无效账户带来不必要的损失，请即时清理无效账户！</Text>
                <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.invalidWalletList == null ? [] : this.props.invalidWalletList)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                      <View>
                          <Button > 
                              <View style={styles.codeout} >
                                  <View style={styles.copyout}>
                                      <Text style={styles.copytext}>{rowData.name}</Text>
                                  </View>
                                  <TouchableOpacity style={styles.taboue} >
                                      <View style={styles.tabview} >
                                          <Image source={rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                      </View>  
                                  </TouchableOpacity>  
                              </View> 
                          </Button>  
                      </View>      
                    )}                   
                  /> 
                  <Button onPress={this.delInvalidWallet.bind(this)}>
                      <View style={styles.deleteout}>
                          <Text style={styles.deletetext}>一键删除</Text>
                      </View>
                  </Button>  
              </View>
            </TouchableOpacity>
        </Modal>
      </View>
    )
  };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UColor.secdColor,
  },

  listout: {
    height: ScreenUtil.autoheight(70),
  },

  row: {
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    paddingVertical: ScreenUtil.autowidth(15),
    paddingHorizontal: ScreenUtil.autowidth(20),
    justifyContent: "space-between",
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: UColor.secdColor
  },

  topbtn: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    width: ScreenWidth,
    paddingTop: ScreenUtil.autoheight(30),
    paddingHorizontal: ScreenUtil.autowidth(10),
    backgroundColor: UColor.mainColor, 
  },
  toptext: {
    height: ScreenUtil.autoheight(65),
    lineHeight: ScreenUtil.autoheight(65),
    textAlign: "center",
    fontSize: ScreenUtil.setSpText(18),
    color: UColor.fontColor,
  },

  bgout: {
    justifyContent: "center" 
  },
  head: {
    height: ScreenUtil.autoheight(70), 
    flexDirection: "row",
    backgroundColor: UColor.secdColor, 
    borderRadius: 5,  
    marginVertical: ScreenUtil.autoheight(20),
    marginHorizontal: ScreenUtil.autowidth(10),
  },
  headbtn: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: 'center',
    padding: ScreenUtil.autowidth(5),
  },
  headbtnout: {
    flex:1, 
    alignItems: 'center', 
    justifyContent: "center",
  },
  headbtntext: {
    color: UColor.arrow,
    fontSize: ScreenUtil.setSpText(14),
  },

  addto: {
    height: ScreenUtil.autoheight(75), 
    backgroundColor: UColor.mainColor, 
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: UColor.tintColor, 
    borderBottomWidth: 2,
    paddingHorizontal: ScreenUtil.autowidth(5),
  },
  addout: {
    flex: 1, 
    flexDirection: "column", 
    alignItems: 'flex-start', 
    justifyContent: "center",
  },
  addtotext: { 
    fontSize: ScreenUtil.setSpText(16), 
    color: UColor.fontColor
  },
  imgTeOy: {
    width: ScreenUtil.autowidth(25),
    height: ScreenUtil.autoheight(15),
    marginHorizontal: ScreenUtil.autowidth(5),
  },
  addtoout: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center', 
    justifyContent: "center", 
  },
  addtoouttext: {
    fontSize: ScreenUtil.setSpText(20), 
    color: UColor.fontColor 
  },
  addtobtn: {
    width: ScreenUtil.autowidth(60), 
    alignItems: 'center', 
    justifyContent: "center",
  },
  addbtnout: {
    flex:1,  
    alignItems: 'center', 
    justifyContent: "center",
  },
  addbtnimg: {
    color:UColor.fontColor ,
    fontSize: ScreenUtil.setSpText(14), 
    textAlign:'center'
  },

  touchableouts: {
    flex: 1,
    flexDirection: "column",
  },
  touchable: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    backgroundColor: UColor.mask,
  },
  touchableout: {
    width: ScreenWidth / 2, 
    height: ScreenHeight, 
    backgroundColor: UColor.secdColor, 
    alignItems: 'center', 
    paddingTop: ScreenUtil.autoheight(50),
  },
  touchablelist: {
    width: '100%', 
    borderBottomWidth: 1, 
    borderBottomColor: UColor.mainColor, 
  },

  imgBtn: {
    width: ScreenUtil.autowidth(30),
    height: ScreenUtil.autowidth(30),
    margin: ScreenUtil.autowidth(5),
  },

  walletlist: {
    width: '100%',
    paddingHorizontal: ScreenUtil.autowidth(10),
    height: ScreenUtil.autoheight(68),
    borderBottomWidth: 1, 
    borderBottomColor: UColor.mainColor, 
  },


  topout: {
    flexDirection: "row",
    flex: 1,
    alignItems: 'center',
  },
  outname: {
    fontSize: ScreenUtil.setSpText(14),
    color: UColor.fontColor,
    textAlign: 'left',
    marginRight: ScreenUtil.autowidth(10),
  },
  stopoutBackupsout: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopoutBackups: {
    fontSize: ScreenUtil.setSpText(10),
    color: UColor.tintColor,
    textAlign: 'center',
    paddingHorizontal: ScreenUtil.autowidth(8),
    paddingVertical: ScreenUtil.autoheight(2),
  },

  notactivedout: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UColor.showy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notactived: {
    fontSize: ScreenUtil.setSpText(10),
    color: UColor.showy,
    textAlign: 'center', 
    paddingHorizontal: ScreenUtil.autowidth(8),
    paddingVertical: ScreenUtil.autoheight(2),
  },

  walletaccount: {
    flex:1,
    alignItems: 'center',
    color: UColor.lightgray, 
  },


 ebhbtnout: {
  width: '100%', 
  height: ScreenHeight / 2.5, 
  flexDirection: "column", 
  alignItems: 'center',  
  paddingVertical: ScreenUtil.autoheight(10),
 },

 btnout: {
  width: ScreenUtil.autowidth(140),
  height: ScreenUtil.autoheight(35),
  marginVertical: ScreenUtil.autoheight(10),
  alignItems: 'center', 
  borderRadius: 25, 
  borderWidth: 0.5, 
  borderColor: UColor.lightgray,
 },

  establishout: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  establishimg:{
    width: ScreenUtil.autowidth(25), 
    height: ScreenUtil.autowidth(25), 
  },
  establishtext: {
    marginLeft: ScreenUtil.autowidth(10), 
    fontSize: ScreenUtil.setSpText(15), 
    color: UColor.lightgray,
  },

  pupuo: {
    flex: 1, 
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  modalStyle: {
      width: ScreenWidth,
      height: ScreenHeight * 2 / 3,
      backgroundColor: UColor.fontColor,
  },
  subView: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: ScreenUtil.autoheight(30),
    marginVertical: ScreenUtil.autoheight(15),
    paddingHorizontal: 10,
  },
  titleText: {
    width: ScreenUtil.autowidth(40),
    color: UColor.baseline,
    fontSize: ScreenUtil.setSpText(28),
    textAlign: 'center',
  },
  contentText: {
    fontSize: ScreenUtil.setSpText(18),
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: ScreenUtil.autoheight(20),
  },
  buttonView: {
    alignItems: 'flex-end',
  },
  prompt: {
    fontSize: ScreenUtil.setSpText(12),
    color: UColor.showy,
    textAlign: 'left',
    marginBottom: ScreenUtil.autoheight(20),
    paddingHorizontal: ScreenUtil.autowidth(20),
  },
  codeout: {
    height: ScreenUtil.autoheight(50),
    flexDirection: "row",
    alignItems: 'center',
    marginHorizontal: ScreenUtil.autowidth(15),
    borderBottomColor: UColor.riceWhite,
    borderBottomWidth: 1,
  },
  copyout: {
    flex: 1,
    paddingLeft: ScreenUtil.autowidth(30),
  },
  copytext: {
    fontSize: ScreenUtil.setSpText(15),
    color: UColor.secdColor,
  },

  lefts: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  leftimg: {
    width: ScreenUtil.autowidth(25), 
    height: ScreenUtil.autowidth(25),
  },
  lefttext: {
    marginLeft: ScreenUtil.autowidth(20),
    fontSize: ScreenUtil.setSpText(18),
    color: UColor.fontColor
  },
  rights: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  rightout: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: 'flex-end',
  },
  rightbalance: {
    fontSize: ScreenUtil.setSpText(18), 
    color: UColor.fontColor, 
    textAlign: 'right'
  },
  rightmarket: {
    fontSize: ScreenUtil.setSpText(12),
    color:  UColor.arrow,
    textAlign: 'right',
    marginTop: ScreenUtil.autoheight(3),
  },
  incup:{
    marginLeft: ScreenUtil.autowidth(5), 
    fontSize: ScreenUtil.setSpText(16), 
    color: UColor.riseColor,
  },
  incdo:{
    marginLeft: ScreenUtil.autowidth(5), 
    fontSize: ScreenUtil.setSpText(16), 
    color: UColor.fallColor,
  },

  imgTop: {
    width: ScreenWidth,
    height: ScreenWidth*0.72,
 },
 btnestablish: {
   height: ScreenUtil.autoheight(50),
   backgroundColor:  UColor.tintColor,
   justifyContent: 'center',
   alignItems: 'center',
   marginTop: ScreenUtil.autoheight(90),
   marginHorizontal: ScreenUtil.autowidth(20),
   borderRadius: 5
 },
 btnimport: {
   height: ScreenUtil.autoheight(50),
   backgroundColor:  UColor.mainColor,
   justifyContent: 'center',
   alignItems: 'center',
   marginTop: ScreenUtil.autoheight(25),
   marginHorizontal: ScreenUtil.autowidth(20),
   borderRadius: 5
 },
 btntext: {
   fontSize: ScreenUtil.setSpText(17),
   color: UColor.fontColor,
 },

 taboue: {
  justifyContent: 'center', 
  alignItems: 'center',
},
tabview: {
  width: ScreenUtil.autowidth(24),
  height: ScreenUtil.autowidth(24),
  margin: ScreenUtil.autowidth(5),
  borderColor: UColor.lightgray,
  borderWidth: 1,
},
tabimg: {
  width: ScreenUtil.autowidth(24), 
  height: ScreenUtil.autowidth(24),
},

deleteout: {
  height: ScreenUtil.autoheight(50),
  marginHorizontal: ScreenUtil.autowidth(60),
  marginVertical: ScreenUtil.autoheight(15),
  borderRadius: 6,
  backgroundColor: UColor.tintColor,
  justifyContent: 'center',
  alignItems: 'center'
},
deletetext: {
  fontSize: ScreenUtil.setSpText(16),
  color: UColor.fontColor
},

pupuoBackup: {
  flex: 1, 
  justifyContent: 'center', 
  alignItems: 'center',
  backgroundColor: "rgba(0, 0, 0, 0.4)",
},

headout: {
  paddingTop: ScreenUtil.autoheight(20),
  paddingBottom: ScreenUtil.autoheight(15),
},
warningout: {
  width: ScreenWidth-50,
  marginHorizontal: ScreenUtil.autowidth(15),
  flexDirection: "row",
  alignItems: 'center', 
  // paddingHorizontal: 5,
  // paddingVertical: 5,
  borderColor: UColor.showy,
  borderWidth: 1,
  borderRadius: 5,
},
imgBtnBackup: {
  width: ScreenUtil.autowidth(30),
  height: ScreenUtil.autowidth(30),
},

inptitle: {
  flex: 1,
  fontSize: ScreenUtil.setSpText(15),
  lineHeight: ScreenUtil.autoheight(30),
  color: UColor.fontColor,
},
headtitle: {
  flex: 1,
  color: UColor.showy,
  fontSize: ScreenUtil.setSpText(14),
  lineHeight: ScreenUtil.autoheight(25),
  paddingLeft: ScreenUtil.autowidth(10),
},


  // modal上子View的样式  
  subViewBackup: {
    flexDirection: "row", 
    alignItems: 'center'
  },
  subViewBackup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: ScreenWidth-20,
    height: ScreenUtil.autoheight(30),
  },
  buttonView2: {
    width: ScreenUtil.autowidth(30),
    alignItems: 'center',
    justifyContent: 'center',
  },



    
  systemSettingTip: {
    width: ScreenWidth,
    height: ScreenUtil.autoheight(40),
    flexDirection: "row",
    alignItems: 'center', 
    backgroundColor: UColor.showy,
  },
  systemSettingText: {
    flex: 1,
    color: UColor.fontColor,
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(14)
  },
  systemSettingArrow: {
    color: UColor.fontColor,
    marginRight: ScreenUtil.autowidth(5)
  },
});

export default Home;
