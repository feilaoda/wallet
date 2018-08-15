import React from 'react';
import { connect } from 'react-redux'
import { BackHandler, NavigationActions, Dimensions,NativeModules, Image, ScrollView, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, WebView, FlatList, Platform, Clipboard, TouchableHighlight,Linking, } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Swiper from 'react-native-swiper';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import moment from 'moment';
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import NavigationUtil from '../../utils/NavigationUtil'
import Constants from '../../utils/Constants'
require('moment/locale/zh-cn');

var WeChat = require('react-native-wechat');

const pages = [];
let loadMoreTime = 0;
let currentLoadMoreTypeId;
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
var cangoback = false;
var ITEM_HEIGHT = 100;
@connect(({ banner, newsType, news, wallet}) => ({ ...banner, ...newsType, ...news, ...wallet }))
class News extends React.Component {

  static navigationOptions = {
    title: '资讯',
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      h: ScreenWidth * 0.436,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [{ key: '', title: '' }]
    };
  }
  //组件加载完成
  componentDidMount() {
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.props.dispatch({ type: 'wallet/walletList', payload: {}, callback: (walletArr) => {
        if(walletArr == null || walletArr.length == 0){
          this.props.dispatch({ type: 'wallet/updateGuideState', payload: {guide: true}});
          return;
        }else{
          this.props.dispatch({ type: 'wallet/updateGuideState', payload: {guide: false}});
        }
      }
      });
    } });
    //切换tab完成后执行,不影响ui流畅度
    InteractionManager.runAfterInteractions(() => {
      let i = 0;
      if (this.props.types && this.props.types.length > 0) {
        this.props.types.map((route) => {
          if (i == 0) {
            //加载新闻
            this.props.dispatch({ type: 'news/list', payload: { type: route.key, page: 1, newsRefresh: false } });
            pages.push(1);
          } else {
            pages.push(0);
          }
          i++;
        });
        this.setState({
          routes: this.props.types
        });
      }
    });
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
   
  }

  onBackAndroid = () => {
    if (cangoback) {
      let type = this.state.routes[this.state.index]
      let w = this.web[type.key];
      if (w) {
        w.goBack();
        return true;
      }
    }
  }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.props.types.length; i++) {
      if (this.props.types[i].key == typeId) {
        return i;
      }
    }
  }

  getCurrentRoute() {
    return this.props.types[this.state.index];
  }

  //加载更多
  onEndReached(typeId) {
    pages[index] += 1;
    currentLoadMoreTypeId = typeId;
    const time = Date.parse(new Date()) / 1000;
    const index = this.getRouteIndex(typeId);
    if (time - loadMoreTime > 1) {
      pages[index] += 1;
      this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: pages[index] } });
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  };

  //下拉刷新
  onRefresh = (typeId, refresh) => {
    this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: 1, newsRefresh: refresh } });
    const index = this.getRouteIndex(typeId);
    if (index >= 0) {
      pages[index] = 1;
    }
  };

  //点击新闻
  onPress = (news) => {
    AnalyticsUtil.onEvent('click_Journalism');
    let route = this.getCurrentRoute();
    if (route.type == 2) {
      this.props.dispatch({ type: 'news/openView', payload: { key: route.key, nid: news.id } });

    } else {
      const { navigate } = this.props.navigation;
      this.props.dispatch({ type: 'news/view', payload: { news: news } });
      if (news && news.url && news.url != "") {
        let url = news.url.replace(/^\s+|\s+$/g, "");
        navigate('Web', { title: news.title, url: url, news });
      }
    }
  };

  //长按复制新闻内容
  copy = (news) => {
    
    // let route = this.getCurrentRoute();
    // alert(route.type);
    // if (route.type == 2) {
    //   Clipboard.setString(news.title + news.content);
    //   EasyToast.show("复制成功");
    // }
  }

  onDown = (news) => {
    this.props.dispatch({ type: 'news/down', payload: { news: news } });
    AnalyticsUtil.onEvent('step_on');
  }

  onUp = (news) => {
    this.props.dispatch({ type: 'news/up', payload: { news: news } });
    AnalyticsUtil.onEvent('Fabulous');
  }

  onShare = (news) => {
    this.props.dispatch({ type: 'news/share', payload: { news: news } });
    DeviceEventEmitter.emit('share', news);
    AnalyticsUtil.onEvent('Forward');
  }

  bannerPress = (banner) => {
    if (banner && banner.url && banner.url != "") {
      const { navigate } = this.props.navigation;
      let url = banner.url.replace(/^\s+|\s+$/g, "");
      navigate('Web', { title: banner.title, url: url });
    }
  }

  //切换tab
  _handleIndexChange = index => {
    if (pages[index] <= 0) {
      let type = this.state.routes[index]
      InteractionManager.runAfterInteractions(() => {
        this.onRefresh(type.key, false);
      });
    }
    this.setState({ index });
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({
      index
    });
  }

  webChange = (e) => {
    cangoback = e.canGoBack;
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
  renderScene = ({ route }) => {
    if (route.key == '') {
      return (<View></View>)
    }
    if (route.type == 1) {
      let url = route.url ? route.url.replace(/^\s+|\s+$/g, "") : "";
      const w = (<WebView
        ref={(c) => {
          if (!this.web) {
            this.web = {};
          }
          this.web[route.key] = c;
        }}
        source={{ uri: url }}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        onNavigationStateChange={(e) => { this.webChange(e) }}
      />
      )
      return w;
    }
    const v = (
      <ListView initialListSize={5}  style={{ backgroundColor: UColor.secdColor }} enableEmptySections={true} onEndReachedThreshold={20}
        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
        onEndReached={() => this.onEndReached(route.key)}
        renderHeader = {()=><View style={{ height: this.state.h }}>

        {Constants.netTimeoutFlag==true &&
          <Button onPress={this.openSystemSetting.bind(this)}>
            <View style={styles.systemSettingTip}>
                <Text style={styles.systemSettingText}> 您当前网络不可用，请检查系统网络设置是否正常。</Text>
                <Text style={styles.systemSettingArrow}>></Text>
            </View>
          </Button>}

          <Swiper
            height={this.state.h}
            loop={true}  
            autoplay={true}
            horizontal={true}  
            autoplayTimeout={5} 
            paginationStyle={{ bottom: ScreenUtil.autoheight(10) }}
            dotStyle={{ backgroundColor: 'rgba(255,255,255,.2)', width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6) }}
            activeDotStyle={{ backgroundColor: UColor.tintColor, width: ScreenUtil.autowidth(6), height: ScreenUtil.autowidth(6) }}>
            {this.renderSwipeView()}
          </Swiper>
        </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={this.props.newsRefresh}
            onRefresh={() => this.onRefresh(route.key, true)}
            tintColor={UColor.fontColor}
            colors={['#ddd', UColor.tintColor]}
            progressBackgroundColor={UColor.fontColor}
          />
        }
        dataSource={this.state.dataSource.cloneWithRows(this.props.newsData[route.key] == null ? [] : this.props.newsData[route.key])}
        renderRow={(rowData) => (
          <TouchableHighlight onPress={() => { this.onPress(rowData) }} onLongPress={this.onShare.bind(this, rowData)} activeOpacity={0.8} underlayColor={UColor.secdColor}>
            <View style={styles.row}>
              <Text style={{ fontSize: ScreenUtil.setSpText(16), color: UColor.fontColor, marginTop: ScreenUtil.autoheight(5), }}>{rowData.title}</Text>
              {
                route.type == 2 && <Text numberOfLines={rowData.row} style={{ fontSize: ScreenUtil.setSpText(15), color: '#abb9d7', marginTop: ScreenUtil.autoheight(10), lineHeight: ScreenUtil.autoheight(25) }} >{rowData.content}</Text>
              }
              {route.type == 2 && rowData.row == 3 && <Text style={{ fontSize: ScreenUtil.setSpText(13), color: UColor.tintColor, lineHeight: ScreenUtil.autoheight(20), textAlign: "right", }}>展开更多</Text>}
              {
                route.type != 2 && <Text style={{ fontSize: ScreenUtil.setSpText(15), color: '#abb9d7', marginTop: ScreenUtil.autoheight(10), lineHeight: ScreenUtil.autoheight(25) }} >{rowData.content}</Text>
              }
              <View style={styles.rowFooter}>
                <Text style={{ fontSize: ScreenUtil.setSpText(13), color: '#abb9d7', paddingBottom: ScreenUtil.autoheight(10), marginTop: ScreenUtil.autoheight(10) }}>{moment(rowData.createdate).fromNow()}</Text>

                <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                  <Button onPress={this.onUp.bind(this, rowData)}>
                    <View style={{ flex: 1, flexDirection: "row", padding: ScreenUtil.autowidth(10) }}><Image style={{ width: ScreenUtil.autowidth(18), height: ScreenUtil.autowidth(18) }} source={rowData.isUp ? UImage.up_h : UImage.up} /><Text style={{ marginLeft: ScreenUtil.autowidth(5), fontSize: ScreenUtil.setSpText(13), color: '#abb9d7' }}>{rowData.up}</Text></View>
                  </Button>
                  <Button onPress={this.onDown.bind(this, rowData)}>
                    <View style={{ flex: 1, flexDirection: "row", padding: ScreenUtil.autowidth(10) }}><Image style={{ width: ScreenUtil.autowidth(18), height: ScreenUtil.autowidth(18) }} source={rowData.isDown ? UImage.down_h : UImage.down} /><Text style={{ marginLeft: ScreenUtil.autowidth(5), fontSize: ScreenUtil.setSpText(13), color: '#abb9d7' }}>{rowData.down}</Text></View>
                  </Button>
                  <Button onPress={this.onShare.bind(this, rowData)}>
                    <View style={{ flex: 1, flexDirection: "row", padding: ScreenUtil.autoheight(10) }}><Image style={{ width: ScreenUtil.autowidth(18), height: ScreenUtil.autowidth(18) }} source={UImage.share} /></View>
                  </Button>
                </View>
              </View>
            </View>
          </TouchableHighlight>
        )}
      />
    );
    return (v);
  }

  renderSwipeView() {
    if (this.props.banners != null) {
      return this.props.banners.map((item, i) => {
        return (<Button key={i} onPress={this.bannerPress.bind(this, item)}>
          <Image source={{ uri: item.img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </Button>)
      })
    } else {
      return (<View></View>)
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this.state.routes && <TabViewAnimated
            lazy={true} 
            navigationState={this.state}
            renderScene={this.renderScene.bind(this)}
            renderHeader={(props) => <TabBar onTabPress={this._handleTabItemPress} labelStyle={{ fontSize: ScreenUtil.setSpText(15), margin: 0, marginBottom: ScreenUtil.autoheight(12), paddingTop: ScreenUtil.autoheight(18), color: '#8696B0' }} indicatorStyle={{ backgroundColor: UColor.tintColor, width: ScreenWidth / 3 - 40, marginLeft: 20 }} style={{ backgroundColor: UColor.secdColor }} tabStyle={{ width: ScreenWidth / 3, padding: 0, margin: 0 }} scrollEnabled={true} {...props} />}
            onIndexChange={this._handleIndexChange}
            initialLayout={{ height: 0, width: Dimensions.get('window').width }}
          />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({

  txt: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    fontSize: ScreenUtil.setSpText(30),
},
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
    paddingTop:Platform.OS == 'ios' ? 30 : 20,
  },
  switem: {
    paddingBottom: ScreenUtil.autoheight(10),
    flex: 1,
    backgroundColor: "#000",
    flexDirection: "row",
    flexWrap: "wrap",
    height: ScreenUtil.autoheight(100),
  },
  row: {
    flex: 1,
    backgroundColor: UColor.mainColor,
    flexDirection: "column",
    paddingHorizontal: ScreenUtil.autowidth(25),
    paddingTop: ScreenUtil.autoheight(20),
  },
  rowFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: ScreenUtil.autoheight(10),
  },

  systemSettingTip: {
    width: ScreenWidth,
    height: ScreenUtil.autoheight(40),
    flexDirection: "row",
    alignItems: 'center', 
    backgroundColor: UColor.showy,
  },
  systemSettingText: {
    color: UColor.fontColor,
    textAlign: 'center',
    fontSize: ScreenUtil.setSpText(15),
  },
  systemSettingArrow: {
    flex: 1,
    color: UColor.fontColor,
    textAlign: 'right',
    fontSize: ScreenUtil.setSpText(30),
    marginBottom: ScreenUtil.autoheight(6),
  },
});

export default News;
