import React from 'react';
import { connect } from 'react-redux'
import {Modal,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,Slider,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { SegmentedControls } from 'react-native-radio-buttons'
import Echarts from 'native-echarts'
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import { EasyToast } from '../../components/Toast';

import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
import ProgressBar from '../../components/ProgressBar';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Eos } from "react-native-eosjs";
import {formatEosQua} from '../../utils/FormatUtil';
import Constants from '../../utils/Constants';
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

const trackOption = ['最近交易','持仓大户'];
const transactionOption = ['我的交易','大盘交易'];

var upColor = '#00da3c';
var downColor = '#ec0000';

function splitData(rawData) {
    var categoryData = [];
    var values = [];
    var volumes = [];
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i]);
        volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    }

    return {
        categoryData: categoryData,
        values: values,
        volumes: volumes
    };
}

// // 数据意义：开盘(open)，收盘(close)，最低(lowest)，最高(highest)
var data = splitData([
    ['2013/1/24', 2320.26,2320.26,2287.3,2362.94,117990000],
    ['2013/1/25', 2300,2291.3,2288.26,2308.38,117990000],
    ['2013/1/28', 2295.35,2346.5,2295.35,2346.92,117990000],
    ['2013/1/29', 2347.22,2358.98,2337.35,2363.8,117990000],
    ['2013/1/30', 2360.75,2382.48,2347.89,2383.76,117990000],
    ['2013/1/31', 2383.43,2385.42,2371.23,2391.82,117990000],
    ['2013/2/1', 2377.41,2419.02,2369.57,2421.15,117990000],
    ['2013/2/4', 2425.92,2428.15,2417.58,2440.38,117990000],
    ['2013/2/5', 2411,2433.13,2403.3,2437.42,117990000],
    ['2013/2/6', 2432.68,2434.48,2427.7,2441.73,117990000],
    ['2013/2/7', 2430.69,2418.53,2394.22,2433.89,117990000],
    ['2013/2/8', 2416.62,2432.4,2414.4,2443.03,117990000],
    ['2013/2/18', 2441.91,2421.56,2415.43,2444.8,321230016],
    ['2013/2/19', 2420.26,2382.91,2373.53,2427.07,321230016],
    ['2013/2/20', 2383.49,2397.18,2370.61,2397.94,321230016],
    ['2013/2/21', 2378.82,2325.95,2309.17,2378.82,321230016],
    ['2013/2/22', 2322.94,2314.16,2308.76,2330.88,321230016],
    ['2013/2/25', 2320.62,2325.82,2315.01,2338.78,321230016],
    ['2013/2/26', 2313.74,2293.34,2289.89,2340.71,321230016],
    ['2013/2/27', 2297.77,2313.22,2292.03,2324.63,321230016],
    ['2013/2/28', 2322.32,2365.59,2308.92,2366.16,321230016],
    ['2013/3/1', 2364.54,2359.51,2330.86,2369.65,84410000],
    ['2013/3/4', 2332.08,2273.4,2259.25,2333.54,84410000],
    ['2013/3/5', 2274.81,2326.31,2270.1,2328.14,84410000],
    ['2013/3/6', 2333.61,2347.18,2321.6,2351.44,84410000],
    ['2013/3/7', 2340.44,2324.29,2304.27,2352.02,84410000],
    ['2013/3/8', 2326.42,2318.61,2314.59,2333.67,84410000],
    ['2013/3/11', 2314.68,2310.59,2296.58,2320.96,84410000],
    ['2013/3/12', 2309.16,2286.6,2264.83,2333.29,84410000],
    ['2013/3/13', 2282.17,2263.97,2253.25,2286.33,84410000],
    ['2013/3/14', 2255.77,2270.28,2253.31,2276.22,84410000],
    ['2013/3/15', 2269.31,2278.4,2250,2312.08,84410000],
    ['2013/3/18', 2267.29,2240.02,2239.21,2276.05,84410000],
    ['2013/3/19', 2244.26,2257.43,2232.02,2261.31,84410000],
    ['2013/3/20', 2257.74,2317.37,2257.42,2317.86,84410000],
    ['2013/3/21', 2318.21,2324.24,2311.6,2330.81,248860000],
    ['2013/3/22', 2321.4,2328.28,2314.97,2332,248860000],
    ['2013/3/25', 2334.74,2326.72,2319.91,2344.89,248860000],
    ['2013/3/26', 2318.58,2297.67,2281.12,2319.99,248860000],
    ['2013/3/27', 2299.38,2301.26,2289,2323.48,248860000],
    ['2013/3/28', 2273.55,2236.3,2232.91,2273.55,248860000],
    ['2013/3/29', 2238.49,2236.62,2228.81,2246.87,248860000],
    ['2013/4/1', 2229.46,2234.4,2227.31,2243.95,248860000],
    ['2013/4/2', 2234.9,2227.74,2220.44,2253.42,248860000],
    ['2013/4/3', 2232.69,2225.29,2217.25,2241.34,248860000],
    ['2013/4/8', 2196.24,2211.59,2180.67,2212.59,248860000],
    ['2013/4/9', 2215.47,2225.77,2215.47,2234.73,248860000],
    ['2013/4/10', 2224.93,2226.13,2212.56,2233.04,248860000],
    ['2013/4/11', 2236.98,2219.55,2217.26,2242.48,248860000],
    ['2013/4/12', 2218.09,2206.78,2204.44,2226.26,248860000],
    ['2013/4/15', 2199.91,2181.94,2177.39,2204.99,94130000],
    ['2013/4/16', 2169.63,2194.85,2165.78,2196.43,94130000],
    ['2013/4/17', 2195.03,2193.8,2178.47,2197.51,94130000],
    ['2013/4/18', 2181.82,2197.6,2175.44,2206.03,94130000],
    ['2013/4/19', 2201.12,2244.64,2200.58,2250.11,94130000],
    ['2013/4/22', 2236.4,2242.17,2232.26,2245.12,94130000],
    ['2013/4/23', 2242.62,2184.54,2182.81,2242.62,94130000],
    ['2013/4/24', 2187.35,2218.32,2184.11,2226.12,94130000],
    ['2013/4/25', 2213.19,2199.31,2191.85,2224.63,94130000],
    ['2013/4/26', 2203.89,2177.91,2173.86,2210.58,94130000],
    ['2013/5/2', 2170.78,2174.12,2161.14,2179.65,94130000],
    ['2013/5/3', 2179.05,2205.5,2179.05,2222.81,94130000],
    ['2013/5/6', 2212.5,2231.17,2212.5,2236.07,94130000],
    ['2013/5/7', 2227.86,2235.57,2219.44,2240.26,94130000],
    ['2013/5/8', 2242.39,2246.3,2235.42,2255.21,94130000],
    ['2013/5/9', 2246.96,2232.97,2221.38,2247.86,75560000],
    ['2013/5/10', 2228.82,2246.83,2225.81,2247.67,75560000],
    ['2013/5/13', 2247.68,2241.92,2231.36,2250.85,75560000],
    ['2013/5/14', 2238.9,2217.01,2205.87,2239.93,75560000],
    ['2013/5/15', 2217.09,2224.8,2213.58,2225.19,75560000],
    ['2013/5/16', 2221.34,2251.81,2210.77,2252.87,75560000],
    ['2013/5/17', 2249.81,2282.87,2248.41,2288.09,75560000],
    ['2013/5/20', 2286.33,2299.99,2281.9,2309.39,75560000],
    ['2013/5/21', 2297.11,2305.11,2290.12,2305.3,75560000],
    ['2013/5/22', 2303.75,2302.4,2292.43,2314.18,75560000],
    ['2013/5/23', 2293.81,2275.67,2274.1,2304.95,75560000],
    ['2013/5/24', 2281.45,2288.53,2270.25,2292.59,75560000],
    ['2013/5/27', 2286.66,2293.08,2283.94,2301.7,75560000],
    ['2013/5/28', 2293.4,2321.32,2281.47,2322.1,75560000],
    ['2013/5/29', 2323.54,2324.02,2321.17,2334.33,75560000],
    ['2013/5/30', 2316.25,2317.75,2310.49,2325.72,75560000],
    ['2013/5/31', 2320.74,2300.59,2299.37,2325.53,75560000],
    ['2013/6/3', 2300.21,2299.25,2294.11,2313.43,75560000],
    ['2013/6/4', 2297.1,2272.42,2264.76,2297.1,75560000],
    ['2013/6/5', 2270.71,2270.93,2260.87,2276.86,75560000],
    ['2013/6/6', 2264.43,2242.11,2240.07,2266.69,75560000],
    ['2013/6/7', 2242.26,2210.9,2205.07,2250.63,75560000],
    ['2013/6/13', 2190.1,2148.35,2126.22,2190.1,75560000]
]);

function combineKLine(data) {
    return {
        backgroundColor: UColor.secdColor,
        animation: false,
        // legend: {
        //     bottom: 10,
        //     left: 'center',
        //     data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
        // },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            }
            // extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},
            label: {
                backgroundColor: '#777'
            }
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                brush: {
                    type: ['lineX', 'clear']
                }
            }
        },
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1
            }
        },
        visualMap: {
            show: false,
            seriesIndex: 1,
            dimension: 2,
            pieces: [{
                value: 1,
                color: downColor
            }, {
                value: -1,
                color: upColor
            }]
        },
        grid: [
            {
                top: '8%',
                left: '12%',
                right: '4%',
                height: '50%'
            },
            {
                left: '12%',
                right: '4%',
                top: '65%',
                height: '16%',
                bottom: '0',
            }
        ],
        xAxis: [
            {
                type: 'category',
                data:  data.categoryData,
                scale: true,
                boundaryGap : true,
                axisLine: {onZero: false},
                splitLine: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data:  data.categoryData,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: false},
                axisTick: {show: false},
                splitLine: {show: false},
                axisLabel: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
                // axisPointer: {
                //     label: {
                //         formatter: function (params) {
                //             var seriesValue = (params.seriesData[0] || {}).value;
                //             return params.value
                //             + (seriesValue != null
                //                 ? '\n' + echarts.format.addCommas(seriesValue)
                //                 : ''
                //             );
                //         }
                //     }
                // }
            }
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: false
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {show: false},
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 50,
                end: 100
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'slider',
                top: '85%',
                start: 50,
                end: 100
            }
        ],
        series: [
            {
                name: 'Dow-Jones index',
                type: 'candlestick',
                data: data.values ,
                itemStyle: {
                    normal: {
                        color: upColor,
                        color0: downColor,
                        borderColor: null,
                        borderColor0: null
                    }
                },
                tooltip: {
                    formatter: function (param) {
                        return [
                            '日期:' + param.name + '<hr size=1 style="margin: 3px 0">',
                            '开盘:' + param.data[0] + '<br/>',
                            '收盘:' + param.data[1] + '<br/>',
                            '最低:' + param.data[2] + '<br/>',
                            '最高:' + param.data[3] + '<br/>'
                        ].join('');
    
                    }
                }
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: data.volumes,
            }
        ]
        
    };
}


@connect(({transaction,sticker,wallet}) => ({...transaction, ...sticker, ...wallet}))
class Transaction extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: '交易',
          header:null,  //隐藏顶部导航栏
         //铃铛small_bell/small_bell_h
        //   headerRight: (
        //     // <Button name="share" onPress={() => this._rightTopClick()} >
        //       <View style={{ padding: 15 }}>
        //       <Image source={UImage.small_bell} style={{ width: 22, height: 22 }}></Image>
        //       </View>
        //     // </Button>
        //   )
        };
      };

  constructor(props) {
    super(props);
    this.state = {
        
      selectedSegment:"时分",
      selectedTrackSegment: trackOption[0],
      selectedTransactionRecord: transactionOption[1],
      isBuy: true,
      isSell: false,
      isTxRecord: true,
      isTrackRecord: false,
      balance: '0.0000',   
      slideCompletionValue: 0,
      buyRamAmount: "0",    //输入购买的额度
      eosToKB: '0.0000',
      kbToEos: '0.0000',
      sellRamBytes: "0",    //输入出售的字节数
      myRamAvailable: '0', // 我的可用字节
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      logRefreshing: false,
      newramTradeLog: [],
      logId: "-1",
      modal: false,
      tradename:"RAM",  //交易币种
      showMore:false,  
      showMoreTitle:"更多",
      isKLine:false,  //是否K线
      dataKLine: {},
      business: false,
      error: false,
   };
  }

  componentWillMount() {

    super.componentWillMount();

    // this.props.dispatch({type: 'transaction/clearRamPriceLine',payload:{}});
  }

  componentDidMount(){
      try {
        this.setState({logRefreshing: true});
        // 获取内存市场相关信息
        this.props.dispatch({type: 'transaction/getRamInfo',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});
    
        // 默认获取RAM的时分图
        this.fetchLine(true,24,'24小时');
       
        // 获取钱包信息和余额
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
            this.getAccountInfo();
        }});
        
        this.getRamTradeLog();
        
        DeviceEventEmitter.addListener('getRamInfoTimer', (data) => {
            this.onRefreshing();
        });
      } catch (error) {
        this.setState({logRefreshing: false});
      }


  }

  onRefreshing() {
    this.getRamInfo();
    this.getAccountInfo();
    if(this.state.isTxRecord){
        this.setSelectedTransactionRecord(this.state.selectedTransactionRecord, true);
    }else if(this.state.isTrackRecord){
        this.setSelectedTrackOption(this.state.selectedTrackSegment, true);
    }

  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

    _leftTopClick = () => {
        this.setState({ modal: !this.state.modal });
        this.props.dispatch({type:'sticker/list',payload:{type:1}});
    }
 
    changeToRamTx(){
        this.setState({
            modal: false,
            tradename:"RAM",
          });
    }
    changeCoinType(rowData){
        this.setState({
            modal: false,
            tradename:rowData.name,
          });
    }

  getRamInfo(){
    this.props.dispatch({type: 'transaction/getRamInfo',payload: {}});

    // 获取曲线
    // this.setSelectedOption(this.state.selectedSegment);
  }

  getRamTradeLog(){
    this.props.dispatch({type: 'transaction/getRamTradeLog',payload: {}, callback: (resp) => {
        try {
            if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
                this.setState({
                  newramTradeLog: [],
                });
              }else{
                this.setState({
                  newramTradeLog: resp.data,
                });
              }
        } catch (error) {

        }
    }}); 
  }

  getRamBigTradeLog(){
    this.props.dispatch({type: 'transaction/getRamBigTradeLog',payload: {}});    
  }

  getBigRamRank(){
    this.props.dispatch({type: 'transaction/getBigRamRank',payload: {}});    
  }

  getAccountInfo(){
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        return;
      }
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      try {
        this.setState({ myRamAvailable:((data.total_resources.ram_bytes - data.ram_usage)).toFixed(0)});
      } catch (error) {
          
      }

    } });

    this.getBalance();

  } 

  fetchRAMLine(type,opt){
    InteractionManager.runAfterInteractions(() => {
        this.props.dispatch({type:'transaction/getRamPriceLine',payload:{type}});
    });
  }
  fetchCoinLine(type,opt){
    EasyToast.show("暂未实现K线");
  }
  //获取时分图
  fetchLine(isRamType,type,opt){
    if(isRamType)
    {
        this.fetchRAMLine(type,opt);
    }else{
        this.fetchCoinLine(type,opt);
    }
  }
  fetchRAMKLine(dateType,opt){

    var echartsoption = combineKLine(data);
    this.setState({ dataKLine : echartsoption});
    return;

    InteractionManager.runAfterInteractions(() => {
        this.props.dispatch({type: 'transaction/getRamKLines',payload: {pageSize: "180", dateType: dateType}, callback: (resp) => {
            try {
                if(resp.code == '0'){
                  if(resp.data && resp.data.length > 0){
                    // // 数据意义：日期(record_date),开盘(open)，收盘(close)，最低(min)，最高(max),交易量(volum)
                    // var data = splitData([
                    //     ['2013/1/24', 2320.26,2320.26,2287.3,2362.94,117990000],
                    var  arrayObj = new Array();
                    for(var i = 0;i < resp.data.length;i++){
                        var elementArray = new Array("",0,0,0,0,0);
                        var element = resp.data[i];
                        if(element.record_date){
                            var timezone;
                            try {
                                timezone = moment(element.record_date).format('MM-DD HH:mm');
                            } catch (error) {
                                timezone = "";
                            }
                            elementArray[0] = timezone;
                        }   
                        if(element.open) {
                            elementArray[1] = element.open;
                        }
                        if(element.close){
                            elementArray[2] = element.close;
                        }
                        if(element.min){
                            elementArray[3] = element.min;
                        }
                        if(element.max){
                            elementArray[4] = element.max;
                        }
                        if(element.volum){
                            elementArray[5] = element.volum;
                        }
                        arrayObj[i] = elementArray;
                    }
                    var constructdata = splitData(arrayObj);
                    var echartsoption = combineKLine(constructdata);
                    this.setState({ dataKLine : echartsoption});
                  }else{
                    this.setState({ dataKLine : {}});
                  }
                }
            } catch (error) {
                this.setState({ dataKLine : {}});
            }
        }});
    
    });
    
  }
  fetchCoinKLine(type,opt){
    EasyToast.show("暂未实现K线");
 }
 //获取K线
  fetchKLine(isRamType,type,opt){
    if(isRamType)
    {
        this.fetchRAMKLine(type,opt);
    }else{
        this.fetchCoinKLine(type,opt);
    }
  }

  onClickTimeType(opt){
    var isRamType = this.state.tradename == "RAM" ? true : false;
    if(opt == "时分"){
        this.setState({isKLine:false, showMore: false,selectedSegment:opt});
        this.fetchLine(isRamType,24,'24小时');
        return ;
    }
    
    this.setState({isKLine:true, showMore: false,selectedSegment:opt});
    if(opt == "5分"){
        this.fetchKLine(isRamType,"5m",opt);
    }else if(opt == "15分"){
        this.fetchKLine(isRamType,"15m",opt);
    }else if(opt == "30分"){
        this.fetchKLine(isRamType,"30m",opt);
    }else if(opt == "1小时"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(isRamType,"1h",opt);
    }else if(opt == "1天"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(isRamType,"1d",opt);
    }else if(opt == "1周"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(isRamType,"1w",opt);
    }else if(opt == "1月"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(isRamType,"1M",opt);
    }
  }
  
  onClickMore(){
    this.setState({ showMore: !this.state.showMore });
  }

  selectedTrackOption(opt){
    this.setSelectedTrackOption(opt, false);
  }

  //最近交易，持仓大户
  setSelectedTrackOption(opt, onRefreshing = false){
    if(opt== trackOption[0]){
      this.fetchTrackLine(0,opt,onRefreshing);
    }else {
      this.fetchTrackLine(1,opt,onRefreshing);
    }
  }
  fetchTrackLine(type,opt, onRefreshing = false){
    this.setState({selectedTrackSegment:opt});
    if(type == 0){
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'transaction/getRamBigTradeLog',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});    
    }else{
        // EasyToast.show('开发中，查询区块持仓大户前10名记录');   
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'transaction/getBigRamRank',payload: {}, callback: () => {
            this.setState({logRefreshing: false});
        }});
    }
  }

  selectedTransactionRecord(opt){
    this.setSelectedTransactionRecord(opt, false);
  }

  //我的交易，大盘交易
  setSelectedTransactionRecord(opt, onRefreshing = false){
    if(opt== transactionOption[0]){
      this.selectionTransaction(0,opt,onRefreshing);
    }else {
      this.selectionTransaction(1,opt,onRefreshing);
    }
  }
  selectionTransaction(type, opt, onRefreshing = false){
    this.setState({selectedTransactionRecord:opt});
    if(type == 0){
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            EasyToast.show('未检测到您的账号信息');
        }else{
            if(!onRefreshing){
                this.setState({logRefreshing: true});
            }
            this.props.dispatch({type: 'transaction/getRamTradeLogByAccount',payload: {account_name: this.props.defaultWallet.account, last_id: this.state.logId}, callback: (resp) => {
                try {
                    if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
                        this.setState({
                          newramTradeLog: [],
                          logRefreshing: false,
                        });
                      }else{
                        this.setState({
                          newramTradeLog: resp.data,
                          logRefreshing: false
                        });
                      }
                } catch (error) {
                    this.setState({
                        logRefreshing: false
                    });
                }
            }});
        }
    }else{
        if(!onRefreshing){
            this.setState({logRefreshing: true});
        }
        this.props.dispatch({type: 'transaction/getRamTradeLog',payload: {}, callback: (resp) => {
            try {
                if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
                    this.setState({
                      newramTradeLog: [],
                      logRefreshing: false,
                    });
                  }else{
                    this.setState({
                      newramTradeLog: resp.data,
                      logRefreshing: false
                    });
                  }
            } catch (error) {
                this.setState({
                    logRefreshing: false
                });
            }
        }}); 
    }
  }

  setEosBalance(balance){
    if (balance == null || balance == "") {
        this.setState({balance: '0.0000'});
      } else {
          this.setState({ balance: balance.replace("EOS", "") });
      }
  }

  getBalance() {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            this.setEosBalance(data.data);
          }
        }
      })
}

  goPage(current) {
    if (current == 'isTxRecord'){
        this.setSelectedTransactionRecord(this.state.selectedTransactionRecord);
    }
    else if (current == 'isTrackRecord'){
        this.setSelectedTrackOption(this.state.selectedTrackSegment);   
    } 
    // EasyShowLD.loadingClose(); 
 }
   // 更新"买，卖，交易记录，大单追踪"按钮的状态  
   _updateBtnState(currentPressed, array) { 
    if (currentPressed === 'undefined' || currentPressed === null || array === 'undefined' || array === null ) {  
        return;  
    }  
    let newState = {...this.state};  
    for (let type of array) {  
        if (currentPressed == type) {  
            newState[type] ? {} : newState[type] = !newState[type];  
            this.setState(newState);  
        } else {  
            newState[type] ? newState[type] = !newState[type] : {};  
            this.setState(newState);  
        }  
    } 
    this.goPage(currentPressed);
  }  

  funcButton(style, selectedSate, stateType, buttonTitle) {  
    let BTN_SELECTED_STATE_ARRAY = ['isTxRecord', 'isTrackRecord'];  
    return(  
        <TouchableOpacity style={[style, selectedSate ? {backgroundColor:UColor.tintColor} : {backgroundColor: UColor.secdColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
        </TouchableOpacity>  
    );  
  } 

  businesButton(style, selectedSate, stateType, buttonTitle) {  
    let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell'];  
    return(  
        <TouchableOpacity style={[style, selectedSate ? {backgroundColor:UColor.tintColor} : {backgroundColor: UColor.secdColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
        </TouchableOpacity>  
    );  
  } 

  transformColor(currentPressed) {
      if(currentPressed == 'isBuy'){
        return '#42B324';
      }else if(currentPressed == 'isSell'){
        return UColor.showy;
      }else{
        return UColor.tintColor;
      }
  }


  chkAccount(obj) {
      var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
      for(var i = 0 ; i < obj.length;i++){
          var tmp = obj.charAt(i);
          for(var j = 0;j < charmap.length; j++){
              if(tmp == charmap.charAt(j)){
                  break;
              }
          }
          if(j >= charmap.length){
              //非法字符
              obj = obj.replace(tmp, ""); 
              EasyToast.show('请输入正确的账号');
          }
      }
      return obj;
  }

  chkBuyEosQuantity(obj) {
      obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
      obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
      obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
      obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
      obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
      var max = 9999999999.9999;  // 100亿 -1
      var min = 0.0000;
      var value = 0.0000;
      var floatbalance;
      try {
        value = parseFloat(obj);
        floatbalance = parseFloat(this.state.balance);
      } catch (error) {
        value = 0.0000;
        floatbalance = 0.0000;
      }
      if(value < min|| value > max){
        EasyToast.show("输入错误");
        obj = "";
      }
      if (value > floatbalance) {
        EasyToast.show('账户余额不足,请重输');
        obj = "";
    }
      return obj;
  }
  chkInputSellRamBytes(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    var ram_bytes = 0;
    try {
      value = parseFloat(obj);
      ram_bytes = parseFloat(this.state.myRamAvailable);
    } catch (error) {
      value = 0.0000;
      ram_bytes = 0.0000;
    }
    if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
    }
    if (value * 1024 > ram_bytes) {
      EasyToast.show('可卖KB不足,请重输');
      obj = "";
  }
    return obj;
}

  
  chkAmountIsZero(amount,errInfo)
  {
      var tmp;
      try {
           tmp = parseFloat(amount);
        } catch (error) {
            tmp = 0;
        }
      if(tmp <= 0){
          EasyToast.show(errInfo);
          return true;
      }
      return false;
  }

  // 购买内存
  buyram = (rowData) => { 
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }

    if(this.state.buyRamAmount == ""){
        EasyToast.show('请输入购买金额');
        return;
    }
    if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
        this.setState({ buyRamAmount: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
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
                Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.props.defaultWallet.account, formatEosQua(this.state.buyRamAmount + " EOS"), (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("购买成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("购买失败");
                            }
                        }else{
                            EasyToast.show("购买失败");
                        }
                    }
                });
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

  // 出售内存
  sellram = (rowData) => {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }
    if(this.state.sellRamBytes == ""){
        EasyToast.show('请输入出售内存KB数量');
        return;
    }
    if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存KB数量')){
        this.setState({ sellRamBytes: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
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
                Eos.sellram(plaintext_privateKey, this.props.defaultWallet.account, (this.state.sellRamBytes * 1024).toFixed(0), (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("出售成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("出售失败");
                            }
                        }else{
                            EasyToast.show("出售失败");
                        }
                    }
                });
                
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

  // 购买
  buy = (rowData) => { 
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }

    if(this.state.buyRamAmount == ""){
        EasyToast.show('请输入购买金额');
        return;
    }
    if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
        this.setState({ buyRamAmount: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
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
                Eos.transaction({
                    actions: [{
                        account: "etbexchanger",
                        name: "buytoken", 
                        authorization: [{
                        actor: 'eostokenapp1',
                        permission: 'active'
                        }], 
                        data: {
                            payer: "eostokenapp1",
                            eos_quant: formatEosQua(this.state.buyRamAmount + " EOS"),
                            token_contract: "issuemytoken",
                            token_symbol: "4,TEST",
                            fee_account: "eostokenapp1",
                            fee_rate: "1", 
                        }
                    }]
                }, plaintext_privateKey, (r) => {
                    EasyShowLD.loadingClose();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("购买成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("购买失败");
                            }
                        }else{
                            EasyToast.show("购买失败");
                        }
                    }
                });
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

  // 出售
  sell = (rowData) => {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }

    this. dismissKeyboardClick();
    const view =
    <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
            selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
            placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
        <Text style={styles.inptpasstext}></Text>  
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

            Eos.transaction({
                actions: [{
                    account: "etbexchanger",
                    name: "selltoken", 
                    authorization: [{
                    actor: 'eostokenapp1',
                    permission: 'active'
                    }], 
                    data: {
                        receiver: "eostokenapp1",
                        token_contract: "issuemytoken",
                        quant: formatEosQua("100.0000 TEST"),
                        fee_account: "eostokenapp1",
                        fee_rate: "1", 
                    }
                }]
            }, plaintext_privateKey, (r) => {
                EasyShowLD.loadingClose();
                if(r.isSuccess){
                    this.getAccountInfo();
                    EasyToast.show("出售成功");
                }else{
                    if(r.data){
                        if(r.data.msg){
                            EasyToast.show(r.data.msg);
                        }else{
                            EasyToast.show("出售失败");
                        }
                    }else{
                        EasyToast.show("出售失败");
                    }
                }
            });

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

  getTextPromp(){
    var info = "大单>2000 中单500-200 小单<500";
    return info;
  }

  //输入卖掉的字节数占总字节的比例
  getSellRamRadio()
  {
     var ratio = 0;             //进度条比例值
     try {
         if(this.state.sellRamBytes)
         {
             if(this.state.myRamAvailable){
                //可用字节数存在且大于0
                var tmpsellRamBytes = 0;
                var tmpram_available = 0; 
                try {
                    tmpsellRamBytes = parseFloat(this.state.sellRamBytes);
                    tmpram_available = parseFloat(this.state.myRamAvailable);
                  } catch (error) {
                    tmpsellRamBytes = 0;
                    tmpram_available = 0;
                  }
                if(tmpsellRamBytes > tmpram_available)  
                {
                    //余额不足
                    this.setState({sellRamBytes:""});   
                    EasyToast.show("您的余额不足,请重输");        
                }else if(tmpram_available > 0){
                    ratio = tmpsellRamBytes / tmpram_available;
                } 
             }
         }
     } catch (error) {
        ratio = 0;
     }
     return ratio;
  }

  eosToKB(eos, currentPrice) {
    if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
        return '0';
    }
    return (eos/currentPrice).toFixed(4); 
  }

  kbToEos(kb, currentPrice){
    if(kb == null || kb == '' || currentPrice == null || currentPrice == ''){
        return '0.0000';
    }
    return (kb * currentPrice).toFixed(4);
  }

  openQuery =(payer) => {
      if(payer == 'busines'){
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            this.setState({ error: true });
            setTimeout(() => {
                this.setState({ error: false });
            }, 2000);
        }else{
            this.setState({ business: false});
            const { navigate } = this.props.navigation;
            navigate('RecordQuery', {record:this.props.defaultWallet.account});
        }
      }else{
        const { navigate } = this.props.navigation;
        navigate('RecordQuery', {record:payer});
      }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }
  
  transferTimeZone(time){
    var timezone;
    try {
        timezone = moment(time).add(8,'hours').format('YYYY-MM-DD HH:mm');
    } catch (error) {
        timezone = time;
    }
    return timezone;
  }

  fileterSlideEos(coinList){
    if(coinList == null || coinList == []){
        return [];
    }
   for(var i = 0; i < coinList.length; i++){
       if(coinList[i].name && coinList[i].name == "EOS"){
            coinList.splice(i,1);
            break;
       }
   }
   return coinList;
  }

  render() {
    return <View style={styles.container}>
    <TouchableOpacity style={{ position:'absolute', bottom: 20, right: 0, zIndex: 999, }} onPress={() => this.setState({ business: !this.state.business })}>
        <View style={{height: 28,width: 70,backgroundColor: '#65CAFF',justifyContent: "center", alignItems: "center",borderTopLeftRadius: 15,borderBottomLeftRadius: 15,
           }}>
            <Text style={{fontSize: 12, color: '#fff'}}>交易面板</Text>
        </View>
    </TouchableOpacity>
    <View style={styles.headerTitle}>  
        <TouchableOpacity onPress={this._leftTopClick.bind()}>
            <View style={styles.leftoutTitle} >
                <Image source={this.state.modal ? UImage.tx_slide0 : UImage.tx_slide1} style={styles.HeadImg}/>
            </View>
        </TouchableOpacity>
          <View style={styles.HeadTitle} >
              <Text style={{ fontSize: 18,color: UColor.fontColor, justifyContent: 'center',alignItems: 'center',}} 
                       numberOfLines={1} ellipsizeMode='middle'>{this.state.tradename + "/EOS"}</Text>
          </View>     
          {/* <TouchableOpacity onPress={this._rightTopClick.bind()}>
            <View style={styles.Rightout} >
              <Image source={this.state.isEye ? UImage.reveal_wallet : UImage.reveal_h_wallet} style={styles.HeadImg}/>
            </View>
          </TouchableOpacity> */}
      </View> 

    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
      <ScrollView keyboardShouldPersistTaps="always"refreshControl={
            <RefreshControl refreshing={this.state.logRefreshing} onRefresh={() => this.onRefreshing()}
            tintColor={UColor.fontColor} colors={['#ddd', UColor.tintColor]} progressBackgroundColor={UColor.fontColor}/>}
            >
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
          <View style={styles.header}>
            <View style={styles.leftout}>
              <View style={styles.nameout}>
                <Text style={styles.nametext}>开盘</Text>
                {this.state.tradename == "RAM" ? <Text style={styles.nametext}>内存占比</Text> : <View></View>}
                <Text style={styles.nametext}>总资金</Text>
              </View>
              <View style={styles.recordout}>
                <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.open.toFixed(4) : '0'} EOS/KB</Text>
                {this.state.tradename == "RAM" ?
                <View style={styles.rowout}>
                    <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.usage_ram : 0} GB/{this.props.ramInfo ? this.props.ramInfo.total_ram : 0} GB</Text>
                    <Text style={styles.ashtext}> ({((this.props.ramInfo ? this.props.ramInfo.usage_ram_percent : '0') * 100).toFixed(2)}%)</Text>
                </View> :<View></View>
               }
                <Text style={styles.recordtext}>{this.props.ramInfo ? this.props.ramInfo.total_eos.toFixed(4) : '0'} EOS</Text>
              </View>
            </View>
            <View style={styles.rightout}>
                <View style={styles.presentprice}>
                    <Text style={styles.present}> {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'}</Text>
                    <Text style={styles.toptext}>价格</Text>
                </View>
                <View style={styles.titleout}>
                    <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.incdo:styles.incup}> {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                    <Text style={{color:'#8696B0',fontSize:13,marginTop:2,textAlign:'center', marginLeft:5}}>涨幅</Text>
                </View>
            </View>
          </View>

          <View style={{flex:1,flexDirection:'row',justifyContent: 'center',alignItems:'center',marginLeft: 0,marginRight: 0,backgroundColor: '#4D607E',}}>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button onPress={this.onClickTimeType.bind(this,"时分")}>
                    <View style={{ marginLeft: 2,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "时分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>时分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>时分</Text>}
                    </View>
                </Button>   
            </View>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button onPress={this.onClickTimeType.bind(this,"5分")}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "5分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>5分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>5分</Text>}
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimeType.bind(this,"15分")}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "15分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>15分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>15分</Text>}
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimeType.bind(this,"30分")}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                       {this.state.selectedSegment == "30分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>30分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>30分</Text>}
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickMore.bind(this)}>
                    <View style={{ flexDirection:"row",marginLeft: 0,width: 50, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {(this.state.selectedSegment == "更多" || this.state.selectedSegment == "1小时" || this.state.selectedSegment == "1天"
                           || this.state.selectedSegment == "1周" || this.state.selectedSegment == "1月") ? 
                         <Text style={{fontSize: 15,color: UColor.tintColor,}}>{this.state.showMoreTitle}</Text> : 
                          <Text style={{fontSize: 15,color: UColor.fontColor,}}>{this.state.showMoreTitle}</Text>}
                         <Image source={ UImage.txbtn_more } style={ {flex:0,width: 10, height:5,resizeMode:'contain'}}/>
                    </View>
                </Button> 

            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button disabled={true}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>    </Text>
                    </View>
                </Button> 
            </View>
         </View> 
        {this.state.showMore ?       
            <View style={{flex:1,flexDirection:'row',justifyContent: 'center',alignItems:'center',marginLeft: 0,marginRight: 0,backgroundColor: '#4D607E',}}>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button disabled={true}>
                    <View style={{ marginLeft: 2,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>    </Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button onPress={this.onClickTimeType.bind(this,"1小时")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1小时</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimeType.bind(this,"1天")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1天</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimeType.bind(this,"1周")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1周</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
               <Button onPress={this.onClickTimeType.bind(this,"1月")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1月</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
               <Button disabled={true}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>    </Text>
                    </View>
                </Button> 
            </View>
         </View> 
           
        : <View></View>}  
        {
            this.state.isKLine ? 
            <View style={styles.echartsout}>
            {
                <Echarts option={this.state.dataKLine?this.state.dataKLine:{}} width={ScreenWidth} height={300} />
            }
            </View>
            : <View style={styles.echartsout}>
            {
                <Echarts option={this.props.ramLineDatas?this.props.ramLineDatas:{}} width={ScreenWidth} height={160} />
            }
            </View>
        }
        <View style={styles.tablayout}>  
            {/* {this.funcButton(styles.buytab, this.state.isBuy, 'isBuy', '买')}  
            {this.funcButton(styles.selltab, this.state.isSell, 'isSell', '卖')}   */}
            {this.funcButton(styles.txRecordtab, this.state.isTxRecord, 'isTxRecord', '交易记录')}  
            {this.funcButton(styles.trackRecordtab, this.state.isTrackRecord, 'isTrackRecord', '大单追踪')}  
        </View> 
        {this.state.isTxRecord ? 
                    <View>
                        <View style={styles.toptabout}>
                            <SegmentedControls tint= {UColor.mainColor} selectedTint= {UColor.fontColor} onSelection={this.selectedTransactionRecord.bind(this) }
                                selectedOption={ this.state.selectedTransactionRecord } backTint= {UColor.secdColor} options={transactionOption} />
                        </View>
                        {(this.props.ramTradeLog  != null &&  this.props.ramTradeLog .length == 0) ? <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16, color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                        <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                                renderHeader = {()=><View style={{ flexDirection: "row", paddingHorizontal: 5,marginVertical: 2,marginHorizontal: 5,}}>
                                <Text style={{ flex: 3,paddingLeft: 8, textAlign: 'left',color: '#7382a1'}}>账号</Text>
                                <Text style={{ flex: 4,paddingLeft: 8,textAlign: 'left',color: '#7382a1'}}>数量(EOS)</Text>
                                <Text style={{ flex: 3,paddingLeft: 8,textAlign: 'left',color: '#7382a1'}}>价格(KB)</Text>
                                <Text style={{ flex: 2.5,paddingLeft: 8,textAlign: 'left',color: '#7382a1'}}>时间</Text>
                                </View>
                            }
                            dataSource={this.state.dataSource.cloneWithRows(this.state.newramTradeLog == null ? [] : this.state.newramTradeLog)} 
                            renderRow={(rowData, sectionID, rowID) => (                 
                            <Button onPress={this.openQuery.bind(this,rowData.payer)}>
                                <View style={styles.businessout}>
                                    {rowData.action_name == 'sellram' ? 
                                    <View style={styles.liststrip}>
                                        <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                        <Text style={styles.selltext} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty.replace("EOS", "")}</Text>
                                        <Text style={styles.sellpricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                        <Text style={styles.selltime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    </View>
                                    :
                                    <View style={styles.liststrip}>
                                        <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                        <Text style={styles.buytext} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                        <Text style={styles.buypricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                        <Text style={styles.buytime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    </View>
                                    }
                                </View>
                            </Button>         
                            )}                
                        /> 
                        }
                    </View>: 
            <View>
                <View style={styles.toptabout}>
                    <SegmentedControls tint= {UColor.mainColor} selectedTint= {UColor.fontColor} onSelection={this.selectedTrackOption.bind(this) }
                        selectedOption={ this.state.selectedTrackSegment } backTint= {UColor.secdColor} options={trackOption} />
                </View>
                {this.state.selectedTrackSegment == trackOption[0] ? 
                  <View>
                    {(this.props.ramBigTradeLog != null &&  this.props.ramBigTradeLog.length == 0) ? <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}><Text style={{fontSize: 16, color: UColor.fontColor}}>还没有交易哟~</Text></View> :
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    renderHeader = {()=><View style={{ flexDirection: "row", paddingHorizontal: 5,marginVertical: 2,marginHorizontal: 5,}}>
                        <Text style={{ flex: 3,paddingLeft: 8, textAlign: 'left',color: '#7382a1'}}>账号</Text>
                        <Text style={{ flex: 4,paddingLeft: 8,textAlign: 'left',color: '#7382a1'}}>数量(EOS)</Text>
                        <Text style={{ flex: 3,paddingLeft: 8,textAlign: 'left',color: '#7382a1'}}>价格(KB)</Text>
                        <Text style={{ flex: 2.5,paddingLeft: 8,textAlign: 'left',color: '#7382a1'}}>时间</Text>
                        </View>
                    }
                      dataSource={this.state.dataSource.cloneWithRows(this.props.ramBigTradeLog == null ? [] : this.props.ramBigTradeLog)} 
                      renderRow={(rowData, sectionID, rowID) => (                 
                        <Button onPress={this.openQuery.bind(this,rowData.payer)}>
                            <View style={styles.businessout}>
                                {rowData.action_name == 'sellram' ? 
                                <View style={styles.liststrip}>
                                    <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                    <Text style={styles.selltext} numberOfLines={1}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={styles.sellpricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                    <Text style={styles.selltime} numberOfLines={1} >{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                :
                                <View style={styles.liststrip}>
                                    <Text style={styles.payertext} numberOfLines={1}>{rowData.payer}</Text>
                                    <Text style={styles.buytext} numberOfLines={1}>买 {rowData.eos_qty.replace("EOS", "")}</Text>
                                    <Text style={styles.buypricetext} numberOfLines={1}>{rowData.price != 0?rowData.price:''}</Text>
                                    <Text style={styles.buytime} numberOfLines={1}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                }
                            </View>
                        </Button>      
                      )}                
                    /> 
                    }
                  </View> :
                  <View>
                      <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                        dataSource={this.state.dataSource.cloneWithRows(this.props.bigRamRank == null ? [] : this.props.bigRamRank)} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                            <Button onPress={this.openQuery.bind(this,rowData.account)}>
                                <View style={styles.businessRan}>
                                    <View style={styles.Rankleftout}>
                                        <Text style={styles.accounttext} numberOfLines={1}>{rowData.account}</Text>
                                        <Text style={styles.numtext}>排名 {rowData.num}</Text>
                                    </View>
                                    <View style={styles.Rankcenterout}>
                                        <Text style={{fontSize: 12,color: UColor.arrow,}}>盈亏 
                                        {rowData.profit.indexOf('-') != -1 ?
                                        <Text style={{fontSize: 12, color: '#FF4C4C',}}> {rowData.profit}</Text>
                                        :
                                        <Text style={{fontSize: 12, color: '#5BD91E',}}> {rowData.profit}</Text>
                                        }
                                        </Text>
                                        <Text style={{fontSize: 12,color: UColor.arrow,}}>成本价<Text style={{ fontSize: 12,color: UColor.fontColor,}}> {rowData.historyAverageCost}</Text></Text>
                                    </View>
                                    <View style={styles.Rankrightout}>
                                        <Text style={styles.pertext}>{rowData.per}</Text>
                                        <Text style={styles.quotatext}>{rowData.ramQuota}</Text>
                                    </View>
                                </View>
                            </Button>
                        )}                
                    /> 
                  </View>
                }
                  {/* <Text style={{fontSize: 14,color: UColor.fontColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "center"}}>成交资金分布</Text>
                  <Text style={{fontSize: 12,color: UColor.tintColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "left"}}>{this.getTextPromp()}</Text> */}
                  {/* <View style={{flex:1,paddingTop:1}}>
                    {
                      <Echarts option={
                   {
                            title : {
                                text: '成交资金分布',
                                textStyle: {
                                    align: 'center',
                                    color: UColor.fontColor,
                                    fontSize: 14,
                                },
                                subtext: "大单>2000 中单500-200 小单<500",
                                subtextStyle:{
                                    align: 'left',
                                }
                            },
                            // tooltip : {
                            //     trigger: 'item',
                            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                            // },
                            legend: {
                                orient: 'vertical',
                                left: 'right',
                                top: 'middle',
                                data: ['超大','大单','大中','中单','中小','小单']
                            },
                            series : [
                                {
                                    name: '',   //访问来源
                                    type: 'pie',
                                    radius : ['40%', '70%'],
                                    center: ['35%', '60%'],
                                    hoverAnimation: false,
                                    animation:false,
                                    roam:false,
                                    silent:true,
                                    label:{
                                        show: true,
                                        position: 'inner',
                                    },
                                    data:[
                                        {value:335, name:'超大'},
                                        {value:310, name:'大单'},
                                        {value:234, name:'大中'},
                                        {value:135, name:'中单'},
                                        {value:1548, name:'中小'},
                                        {value:1548, name:'小单'}
                                    ],
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        }
                        
                        } width={ScreenWidth - 10} height={200} />
                    }
                  </View> */}
                 </View>}
        
        </TouchableOpacity>
      </ScrollView>  
    </KeyboardAvoidingView> 

    <Modal style={styles.touchableouts} animationType={'none'} transparent={true} onRequestClose={() => {this.setState({modal: false}); }} visible={this.state.modal}>
          <TouchableOpacity onPress={() => this.setState({ modal: false })} style={styles.touchable} activeOpacity={1.0}>
            <TouchableOpacity style={styles.touchable} activeOpacity={1.0}>

              <View style={styles.touchableout}>
               {/* <TouchableOpacity onPress={this._leftTopClick.bind()}> 
                <View style={{ paddingRight: 0,alignItems: 'flex-end', }} >
                    <Image source={UImage.tx_slide0} style={styles.HeadImg}/>
                </View>
                </TouchableOpacity> */}
               <View style={styles.ebhbtnout}>
                    <View style={{width:'37%'}}>
                        <View style={{ flex:1,flexDirection:"row",alignItems: 'center', }}>
                            <Text style={{marginLeft:10,fontSize:15,color:UColor.fontColor}}>内存</Text>
                        </View>
                    </View>
                    <View style={{width:'28%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start", }}>
                            <Text style={{fontSize:15,marginLeft:0,color:UColor.fontColor}}>涨幅</Text>
                        </View>
                    </View>
                    <View style={{width:'35%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end", }}>
                            <Text style={{ fontSize:15, color:UColor.fontColor, 
                                textAlign:'center', marginRight:5}}>单价(EOS)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.ebhbtnout2}>
                  <Button onPress={this.changeToRamTx.bind(this)}>
                      <View style={styles.sliderow}>
                        <View style={{width:'34%'}}>
                            <View style={{ flex:1,flexDirection:"row",alignItems: 'center'}}>
                                <Text style={{marginLeft:10,fontSize:15,color:UColor.fontColor}}>RAM</Text>
                            </View>
                        </View>
                        <View style={{width:'31%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start"}}>
                            <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.greenincup:styles.redincdo}> {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                            </View>
                        </View>
                        <View style={{width:'35%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                                <Text style={{ fontSize:15, color:UColor.fontColor, 
                                    textAlign:'center', marginRight:5}}>{this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'}</Text>
                            </View>
                        </View>
                      </View>
                  </Button>
                </View>
                <View style={styles.ebhbtnout}>
                    <View style={{width:'37%'}}>
                        <View style={{ flex:1,flexDirection:"row",alignItems: 'center', }}>
                            <Text style={{marginLeft:10,fontSize:15,color:UColor.fontColor}}>币种</Text>
                        </View>
                    </View>
                    <View style={{width:'28%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start", }}>
                            <Text style={{fontSize:15,marginLeft:0,color:UColor.fontColor}}>涨幅</Text>
                        </View>
                    </View>
                    <View style={{width:'35%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end", }}>
                            <Text style={{ fontSize:15, color:UColor.fontColor,textAlign:'center', marginRight:5}}>单价(￥)</Text>
                        </View>
                    </View>
                </View>

                <ListView initialListSize={5} 
                  renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor ,}} />}
                  enableEmptySections={true} dataSource={this.state.dataSource.cloneWithRows(this.props.coinList[1]==null?[]:this.fileterSlideEos(this.props.coinList[1]))}
                  renderRow={(rowData) => (
                    <Button onPress={this.changeCoinType.bind(this, rowData)}>
                      <View style={styles.sliderow}>
                        <View style={{width:'35%'}}>
                            <View style={{ flex:1,flexDirection:"row",alignItems: 'center'}}>
                                <Text style={{marginLeft:10,fontSize:15,color:UColor.fontColor}}>{rowData.name == null ? "" : rowData.name}</Text>
                            </View>
                        </View>
                        <View style={{width:'30%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start"}}>
                                <Text style={rowData.increase>0?styles.greenincup:styles.redincdo}>{rowData.increase>0?'+'+rowData.increase:rowData.increase}%</Text>
                            </View>
                        </View>
                        <View style={{width:'35%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                                <Text style={{ fontSize:15, color:UColor.fontColor, 
                                    textAlign:'center', marginRight:5}}>{(rowData.price == null || rowData.price == "") ? "" : rowData.price.toFixed(2)}</Text>
                            </View>
                        </View>
                      </View>
                    </Button> 
                  )}
                />
           </View>
          </TouchableOpacity>
      </TouchableOpacity>
    </Modal>

    <Modal style={styles.businesmodal} animationType={'slide'} transparent={true} onRequestClose={() => {this.setState({business: false}) }} visible={this.state.business}>
        <TouchableOpacity onPress={() => this.setState({ business: false })} style={styles.businestouchable} activeOpacity={1.0}>

        <TouchableOpacity style={styles.busines} activeOpacity={1.0}>
            <View style={styles.businesout}>
                <View style={styles.headbusines}>
                    <View style={styles.businestab}>  
                        {this.businesButton(styles.buytab, this.state.isBuy, 'isBuy', '买')}  
                        {this.businesButton(styles.selltab, this.state.isSell, 'isSell', '卖')}  
                    </View>
                    <View style={{flex: 1,flexDirection: 'row',}}> 
                        <TouchableOpacity onPress={this.openQuery.bind(this,'busines')} style={styles.busrecord}>
                            <Image source={ UImage.record } style={styles.busrecordimg} resizeMode= 'contain'/>
                            <Text style={styles.busrecordtext}> 我的记录</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.setState({ business: false })}>
                            <Image source={ UImage.redclose } style={styles.redclose}  resizeMode='contain'/>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.error&&<Text style={{width: ScreenWidth, paddingHorizontal: 40, fontSize: 12, color: UColor.showy, textAlign: 'right', }}>未检测到您的账号信息</Text>}
                {this.state.isBuy?<View>
                    <View style={styles.greeninptout}>
                        <Text style={styles.greenText}>单价: {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'} EOS/KB</Text>
                        <Text style={styles.inptTitle}>余额: {this.state.balance==""? "0.0000" :this.state.balance} EOS</Text>
                    </View>
                    <View style={styles.inputout}>
                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount + ''} returnKeyType="go" 
                        selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                        placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                        onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkBuyEosQuantity(buyRamAmount), 
                            eosToKB: this.eosToKB(buyRamAmount, this.props.ramInfo?this.props.ramInfo.price:'')})}
                        />
                        <Text style={styles.unittext}>EOS</Text>
                    </View>
                    <View style={styles.inputout}>
                        <Text style={styles.conversion}>≈{this.state.eosToKB}</Text>
                        <Text style={styles.unittext}>KB</Text>
                    </View>
                    <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={styles.progressbar}>
                                <Slider maximumValue={this.state.balance*1} minimumValue={0} step={0.0001} value={this.state.buyRamAmount*1}
                                onSlidingComplete={(value)=>this.setState({ buyRamAmount: value.toFixed(4), eosToKB: this.eosToKB(value.toFixed(4), this.props.ramInfo?this.props.ramInfo.price:'')})}
                                maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                                />
                                <View style={styles.paragraph}>
                                    <Text style={styles.subsection}>0</Text>
                                    <Text style={styles.subsection}>1/3</Text>     
                                    <Text style={styles.subsection}>2/3</Text>
                                    <Text style={styles.subsection}>ALL</Text>                                
                                </View>    
                            </View>
                            <Button onPress={this.buyram.bind(this)}>
                                <View style={styles.botn} backgroundColor={'#42B324'}>
                                    <Text style={styles.botText}>买入</Text>
                                </View>
                            </Button> 
                        </View>
                    </View>
                </View>
                :
                <View>
                    <View style={styles.greeninptout}>
                        <Text style={styles.redText}>单价: {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'} EOS/KB</Text>
                        <Text style={styles.inptTitle}>可卖: {(this.state.myRamAvailable == null || this.state.myRamAvailable == '') ? '0' : (this.state.myRamAvailable/1024).toFixed(4)} KB</Text>
                    </View>
                  <View style={styles.inputout}>
                      <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes + ''} returnKeyType="go" 
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                      placeholder="输入出售数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                      onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkInputSellRamBytes(sellRamBytes), kbToEos: this.kbToEos(sellRamBytes, this.props.ramInfo?this.props.ramInfo.price:'')})}
                      />
                      <Text style={styles.unittext}>KB</Text>
                  </View>
                  <View style={styles.inputout}>
                      <Text style={styles.conversion}>≈{(this.state.kbToEos == null || this.state.kbToEos == '') ? '0' : this.state.kbToEos}</Text>
                      <Text style={styles.unittext}>EOS</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={styles.progressbar}>
                                <Slider maximumValue={this.state.myRamAvailable*1} minimumValue={0} step={0.0001} value={this.state.sellRamBytes*1024}
                                    onSlidingComplete={(value)=>this.setState({ sellRamBytes: (value/1024).toFixed(4), kbToEos: this.kbToEos(value/1024, this.props.ramInfo?this.props.ramInfo.price:'')})}
                                    maximumTrackTintColor={UColor.tintColor} minimumTrackTintColor={UColor.tintColor} thumbTintColor={UColor.tintColor}
                                    />
                                <View style={styles.paragraph}>
                                    <Text style={styles.subsection}>0</Text>
                                    <Text style={styles.subsection}>1/3</Text>     
                                    <Text style={styles.subsection}>2/3</Text>
                                    <Text style={styles.subsection}>ALL</Text>                                
                                </View> 
                            </View>
                            <Button onPress={this.sellram.bind(this)}>
                                <View style={styles.botn} backgroundColor={UColor.showy}>
                                    <Text style={styles.botText}>卖出</Text>
                                </View>
                            </Button> 
                        </View>
                  </View>
                </View>}
            </View>
            </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  </View>
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },
    headerTitle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        paddingBottom: 5,
        backgroundColor: UColor.mainColor,
      },
    leftoutTitle: {
        paddingLeft: 15
      },
    HeadImg: {
        width: 25,
        height:15,
        marginHorizontal:1,
    },
    HeadTitle: {
    flex: 1,
    paddingLeft: 60,
    paddingHorizontal: 20,
    justifyContent: 'center', 
    },
    
    header: {
      width: ScreenWidth,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    leftout: {
        flexDirection: "row",
        flex: 6,
        height: 50,
    },
    nameout: {
        flexDirection: 'column',
        justifyContent: 'space-around'
    },
    nametext: {
        color: '#8696B0',
        fontSize: 10,
    },
    recordout: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
        paddingLeft: 5,
    },
    recordtext: {
        color: '#fff',
        fontSize: 11,
    },
    rowout: {
        flexDirection: "row",
    },
    ashtext: {
        color: '#8696B0',
        fontSize: 11,
    },
    rightout: {
        flexDirection:'column',
        flexGrow:1,
        alignItems:"flex-end",
        marginRight:10
    },
    titleout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    presentprice: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    toptext: {
        color: '#8696B0', 
        fontSize: 13, 
        marginTop: 2, 
        textAlign: 'center', 
        marginLeft: 5, 
        marginRight: 2
    },
    present: {
        color: '#fff',
        fontSize: 20,
        textAlign:'center'
    },

    row:{
      flex:1,
      backgroundColor:UColor.mainColor,
      flexDirection:"row",
      padding: 20,
      borderBottomColor: UColor.secdColor,
      borderBottomWidth: 0.6,
    },
    left:{
      width:'25%',
      flex:1,
      flexDirection:"column"
    },
    right:{
      width:'85%',
      flex:1,
      flexDirection:"column"
    },
    incup:{
      fontSize:20,
      color:'#F25C49',
      textAlign:'center',
    },
    incdo:{
      fontSize:20,
      color:'#25B36B',
      textAlign:'center',
    },
    toptabout: {
        padding: 10,
        paddingTop: 5
    },
    echartsout: {
        flex: 1,
    },
    tablayout: {   
        flex: 1,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: UColor.secdColor,
    },
    txRecordtab: {
        flex: 1,
        height: 26,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    trackRecordtab: {
        flex: 1,
        height: 26,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
   
    inptoutsource: {
      marginTop: 10,
      paddingHorizontal: 20,
      paddingBottom: 5,
      justifyContent: 'center',
      flexDirection: 'row',  
      alignItems: 'center',
    },
    outsource: {
      flexDirection: 'row',  
      alignItems: 'center',
    },
    progressbar: {
        flex: 1,
        paddingRight: 20,
    },
    inpt: {
      flex: 1, 
      color: UColor.fontColor, 
      fontSize: 15, 
      height: 45, 
      paddingLeft: 10, 
    },
    paragraph: {
        height: 30,
        flexDirection: 'row',
        paddingHorizontal: Platform.OS == 'ios' ? 0 : 15,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subsection: {
        fontSize: 12,
        color: UColor.arrow
    },
    greeninptout: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    greenText: {
      flex:1,
      fontSize: 14, 
      color: "#42B324", 
      lineHeight: 35,
      textAlign: "left"
    },

    redText: {
      flex:1,
      fontSize: 14, 
      color: UColor.showy, 
      lineHeight: 35,
      textAlign: "left"
    },

    inptTitle: {
      flex: 1,
      fontSize: 14, 
      color: UColor.fontColor, 
      lineHeight: 35,
      textAlign: "right"
    },

    inputout: {
        height: 30,
        marginHorizontal: 18,
        marginBottom: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#38465C',
        borderRadius: 5,
    },
    conversion: {
        flex: 1,
        color: UColor.arrow,
        fontSize: 15,
        paddingLeft: 10,
    },
    unittext: {
        fontSize: 15,
        color: UColor.fontColor,
    },

    botn: {
      marginLeft: 10, 
      width: 70, 
      height: 30,  
      borderRadius: 3, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },

    botText: {
      fontSize: 17, 
      color: UColor.fontColor,
    },

    businessout: {
        height: Platform.OS == 'ios' ? 41 : 34,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: 5,
        borderRadius: 5,
        marginVertical: 2,
        marginHorizontal: 5,
    },
    liststrip: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    sellpricetext: {
        flex: 3,
        fontSize: 14,
        color: '#F25C49',
        textAlign: 'left',
        paddingLeft: 8,
    },
    buypricetext: {
        flex: 3,
        fontSize: 14,
        color: "#4ed694",
        textAlign: 'left',
        paddingLeft: 8,
    },

    payertext: {
        flex: 3,
        fontSize: 14,
        color: UColor.fontColor,
        textAlign: 'left'
    },
    selltext: {
        flex: 4,
        fontSize: 14,
        color: '#F25C49',
        textAlign: 'left',
        paddingLeft: 8,
    },
    selltime: {
        flex: 2.5,
        fontSize: 12,
        color: "#F25C49",
        textAlign: 'left'
    },
    buytext: {
        flex: 4,
        fontSize: 14,
        color: "#4ed694",
        textAlign: 'left',
        paddingLeft: 8,
    },
    buytime: {
        flex: 2.5,
        fontSize: 12,
        color: "#4ed694",
        textAlign: 'left'
    },

    businessRan: {
        height: Platform.OS == 'ios' ? 52 : 45,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: 5,
        borderRadius: 5,
        marginVertical: 2,
        marginHorizontal: 5,
    },
    Rankleftout: {
        flex: 4.5,
        flexDirection: "column",
        justifyContent: "space-around",
    },
    accounttext: {
        fontSize: 15,
        color: UColor.fontColor,
    },
    numtext: {
        fontSize: 15,
        color: UColor.arrow,
    },
    Rankcenterout: {
        flex: 4.5,
        flexDirection: "column",
        justifyContent: "space-around",
    },

    Rankrightout: {
        flex: 3,
        flexDirection: "column",
        justifyContent: "space-around",
    },
    pertext: {
        fontSize: 15,
        color: UColor.fontColor,
        textAlign: 'right',
    },
    quotatext: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'right',
    },

    sliderow:{
        flex:1,
        flexDirection:"row",
        borderBottomColor: '#4D607E',
        borderBottomWidth: 0.6,
        height: 30, 
      },
    touchableouts: {
        flex: 1,
        flexDirection: "column",
      },
    touchable: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        backgroundColor: UColor.mask,
    },
    touchableout: {
        width: (ScreenWidth * 2)/ 3, 
        height: ScreenHeight, 
        backgroundColor: '#4D607E', 
        alignItems: 'center', 
        paddingTop: 40,
    },
    touchablelist: {
        width: '100%', 
        borderBottomWidth: 1, 
        borderBottomColor: '#4D607E', 
    },

  imgBtn: {
    width: 30,
    height: 30,
    margin:5,
  },
  
  ebhbtnout: {
    width: '100%', 
    height: 30, 
    flexDirection: "row", 
    alignItems: 'flex-start', 
    borderTopWidth: 1, 
    borderTopColor: UColor.mainColor, 
    backgroundColor:'#586888',
   },
   ebhbtnout2: {
    width: '100%', 
    height: 30, 
    flexDirection: "column", 
    alignItems: 'flex-start', 
    borderTopWidth: 1, 
    borderTopColor: UColor.mainColor, 
    backgroundColor:'#4D607E',
   },
    establishout: {
      flex: 1, 
      flexDirection: "row",
      alignItems: 'center', 
      height: 30, 
    },
    establishimg:{
      width: 25, 
      height: 25, 
    },

    greenincup:{
        fontSize:15,
        color:'#25B36B',
      },
    redincdo:{
        fontSize:15,
        color:'#F25C49',
    },



    businesmodal: {
        width: ScreenWidth , 
        height: ScreenHeight-50,
        flexDirection: "column",
        justifyContent: 'flex-end',
        backgroundColor: UColor.tintColor,
    },
    businestouchable: {
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0)'
    },
    busines: {
        width: ScreenWidth , 
        height: 250,
        paddingBottom: 49,
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0)'
    },
    businesout: {
        width: ScreenWidth , 
        height: 250,
        backgroundColor: '#43536D', 
        alignItems: 'center', 
    },
    businestab: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingLeft: 20,
        backgroundColor: UColor.secdColor,
    },
    buytab: {
        flex: 1,
        height: 26,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    selltab: {
        flex: 1,
        height: 26,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    busrecord: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
    },
    busrecordimg: {
        width: 12,
        height: 16,
        
    },
    busrecordtext: {
        fontSize: 14,
        color: '#65CAFF',
    },
    redclose: {
        width: 40,
        height: 40,
       
    },
    headbusines: {
        width: ScreenWidth,
        height: 40,
        flexDirection: 'row',
        justifyContent: "center",
    },

});

export default Transaction;
