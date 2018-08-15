import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,NativeModules, InteractionManager,ListView,StyleSheet,Image,View,RefreshControl,Text,Platform,Linking,} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import ScreenUtil from '../../utils/ScreenUtil'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import Button from  '../../components/Button'
import Ionicons from 'react-native-vector-icons/Ionicons'
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import Constants from '../../utils/Constants'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const pages = [];
let loadMoreTime = 0;
let currentLoadMoreTypeId;
let timer;
let currentTab=0;

@connect(({sticker}) => ({...sticker}))
class Coins extends React.Component {

  static navigationOptions = {
    title: '行情'
  };
  
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      routes: [
        { key: '0', title: '自选'},
        { key: '1', title: '市值'},
        { key: '2', title: '涨跌'},
        { key: '3', title: '成交'},
      ]
    };
  }
  //组件加载完成
  componentDidMount() {
    const {dispatch}=this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch({type: 'sticker/list',payload:{type:-1}});
      this.startTick(0);
    });
    var th = this;
    DeviceEventEmitter.addListener('changeTab', (tab) => {
       if(tab=="Coins" || tab=="Coin"){
        th.startTick(th.state.index);
       }else{
        if(timer){
          clearInterval(timer);
        }
       }
    });
    DeviceEventEmitter.addListener('coinSlefChange', (tab) => {
      dispatch({type:'sticker/list',payload:{type:0},callback:()=>{
        
      }});
   });
   //推送初始化
   const { navigate } = this.props.navigation;
   DeviceEventEmitter.addListener('changeTab', (tab) => {
    const { navigate } = this.props.navigation;
  })
  }

  componentWillUnmount(){
    if(timer){
      clearInterval(timer);
    }
    DeviceEventEmitter.removeListener('changeTab');
  }

  startTick(index){
    const {dispatch}=this.props;
    InteractionManager.runAfterInteractions(() => {
      clearInterval(timer);
      timer=setInterval(function(){
        dispatch({type:'sticker/list',payload:{type:index}});
      },7000);
    });
  }

  onRefresh(key){
    this.startTick(this.getRouteIndex(key));
  }

  //获得typeid坐标
  getRouteIndex(typeId){
    for(let i=0;i<this.state.routes.length;i++){
        if(this.state.routes[i].key==typeId){
            return i;
        }
    }
  }

  //点击
  onPress = (coins) => {
    const { navigate } = this.props.navigation;
    navigate('Coin', { coins });
    AnalyticsUtil.onEvent('Details_money');
  };

  //切换tab
  _handleIndexChange = index => {
    this.startTick(index);
    // this.setState({index});
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({index});
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

  //渲染页面
  renderScene = ({route}) => {
    if(route.key==''){
      return (<View></View>)
    }
    const v = (
      <ListView
        initialListSize={10}
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{height:0.5,backgroundColor: UColor.secdColor}} />}
        style={{backgroundColor:UColor.secdColor}}
        enableEmptySections={true}
        renderHeader = {()=><View>
          {Constants.netTimeoutFlag==true &&
            <Button onPress={this.openSystemSetting.bind(this)}>
              <View style={styles.systemSettingTip}>
                  <Text style={styles.systemSettingText}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                  <Ionicons style={styles.systemSettingArrow} name="ios-arrow-forward-outline" size={20} />
              </View>
            </Button>}  
            </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={this.props.loading}
            onRefresh={() => this.onRefresh(route.key)}
            tintColor={UColor.fontColor}
            colors={['#ddd',UColor.tintColor]}
            progressBackgroundColor={UColor.fontColor}
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.props.coinList[route.key]==null?[]:this.props.coinList[route.key])}
        renderRow={(rowData) => (
          <Button onPress={this.onPress.bind(this,rowData)}>
            <View style={styles.row}>
              <View style={{width:'35%'}}>
                 <View style={{ flex:1,flexDirection:"row",alignItems: 'center',paddingTop: ScreenUtil.autoheight(15)}}>
                    <Image source={{uri:rowData.img}} style={{width: ScreenUtil.autowidth(25),height: ScreenUtil.autowidth(25)}} />
                    <Text style={{marginLeft: ScreenUtil.autowidth(20),fontSize:ScreenUtil.setSpText(18),color:UColor.fontColor}}>{rowData.name}</Text>
                  </View>
                  <View>
                    <Text style={{marginTop: ScreenUtil.autoheight(10),fontSize:ScreenUtil.setSpText(10),color:'#8696B0'}}>市值${formatterUnit(rowData.value)}</Text>
                  </View>
              </View>
              <View style={{width:'65%'}}>
                <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                  <View style={{flex:1,flexDirection:"column",alignItems:'flex-end',paddingTop: ScreenUtil.autoheight(25)}}>
                    <Text style={{fontSize:ScreenUtil.setSpText(18),color:UColor.fontColor}}>￥{rowData.price}</Text>
                    <Text style={{marginTop: ScreenUtil.autoheight(15),fontSize:ScreenUtil.setSpText(10),color:'#8696B0'}}>量 {formatterNumber(rowData.txs)}</Text>
                  </View>
                  <Text style={rowData.increase>0?styles.incdo:styles.incup}>{rowData.increase>0?'+'+rowData.increase:rowData.increase}%</Text>
                </View>
              </View>
            </View>
          </Button>
        )}
      />
    );
    return (v);
  }
  render() {
    return (
      <View style={styles.container}>
        <TabViewAnimated
        lazy={true}
        style={styles.container}
        navigationState={this.state}
        renderScene={this.renderScene.bind(this)}
        renderHeader={(props)=><TabBar onTabPress={this._handleTabItemPress} labelStyle={{fontSize:ScreenUtil.setSpText(15),margin:0,marginBottom:10,paddingTop:10,color:'#8696B0'}} indicatorStyle={{backgroundColor:UColor.tintColor,width:60,marginLeft:20}} style={{backgroundColor:UColor.secdColor}} tabStyle={{width:100,padding:0,margin:0}} scrollEnabled={true} {...props}/>}
        onIndexChange={this._handleIndexChange}
        initialLayout={{height:0,width:Dimensions.get('window').width}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor
  },
  row:{
    flex:1,
    backgroundColor:UColor.mainColor,
    flexDirection:"row",
    padding: ScreenUtil.autowidth(20),
    paddingTop: ScreenUtil.autoheight(10),
    justifyContent:"space-between",
  },
  left:{
    flex:1,
    flexDirection:"column",
    backgroundColor:'red'
  },
  right:{
    flex:1,
    flexDirection:"column",
    backgroundColor:'black'
  },
  incup:{
    fontSize: ScreenUtil.setSpText(12),
    color:UColor.fontColor,
    backgroundColor:'#F25C49',
    padding: ScreenUtil.autowidth(5),
    textAlign:'center',
    marginLeft: ScreenUtil.autowidth(10),
    borderRadius: 5,
    minWidth: ScreenUtil.autowidth(60),
    maxHeight: ScreenUtil.autoheight(25),
  },
  incdo:{
    fontSize: ScreenUtil.setSpText(12),
    color:UColor.fontColor,
    backgroundColor:'#25B36B',
    padding: ScreenUtil.autowidth(5),
    textAlign:'center',
    marginLeft: ScreenUtil.autowidth(10),
    borderRadius: 5,
    minWidth: ScreenUtil.autowidth(60),
    maxHeight: ScreenUtil.autoheight(25)
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

export default Coins;
