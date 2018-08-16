import Request from '../utils/RequestUtil';
import {getRamInfo, getRamPriceLine, getRamTradeLog, getRamBigTradeLog, getRamTradeLogByAccount, getBigRamRank,
    getRamKLines,getETList,getETInfo,getETPriceLine,getETKLine,getETTradeLog,getETBigTradeLog,getETTradeLogByAccount,getBalance} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import Constants from '../utils/Constants'
let newarr = new Array();

export default {
    namespace: 'transaction',
    state: {

    },
    effects: {
        *getRamInfo({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getRamInfo, 'post', payload);
                if(resp.code=='0'){               
                    yield put({ type: 'updateInfo', payload: { ramInfo:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
        *getRamPriceLine({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getRamPriceLine + payload.type, 'post', payload);
                // alert("getRamPriceLine : " + JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateRamPriceLine', payload: { data: resp.data, ...payload } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *clearRamPriceLine({ payload }, { call, put }) {
            try {
                yield put({ type: 'clearRamPriceLine', payload: { data: null } });
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        //所有交易查询
        *getRamTradeLog({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getRamTradeLog, 'post', payload);
                // alert('getRamTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateTradeLog', payload: { ramTradeLog:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        *getRamBigTradeLog({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getRamBigTradeLog, 'post', payload);
                // alert('getRamBigTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateBigTradeLog', payload: { ramBigTradeLog:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //个人交易记录查询
        *getRamTradeLogByAccount({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getRamTradeLogByAccount, 'post', payload);
                // alert('getRamTradeLogByAccount: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateTradeLog', payload: { ramTradeLog:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        *getBigRamRank({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getBigRamRank, 'get');
                // alert('getBigRamRank: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateBigRamRank', payload: { bigRamRank:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ramK线图
        *getRamKLines({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getRamKLines, 'post', payload);
                //  alert('getRamKLines: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    // yield put({ type: 'updateRamPriceLine', payload: { data: resp.data, ...payload } });
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },

        //ET交易所接口
        //交易列表
        *getETList({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getETList, 'get');
                //  alert('getETList: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETList', payload: { etlist:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
          },
        //获取币信息
        *getETInfo({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getETInfo + payload.code, 'get');
                // alert('getETInfo: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETInfo', payload: { etinfo:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //et时分图
        *getETPriceLine({payload,callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getETPriceLine + payload.code + '/' + payload.type, 'post', payload);
                // alert("getETPriceLine : " + JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETPriceLine', payload: { data: resp.data, ...payload } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        //et K线图
        *getETKLine({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getETKLine, 'post', payload);
                // alert('getETKLine: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    // yield put({ type: 'updateRamPriceLine', payload: { data: resp.data, ...payload } });
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET获取最新交易单
        *getETTradeLog({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getETTradeLog + payload.code, 'post', payload);
                // alert('getETTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETTradeLog', payload: { etTradeLog:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET获取大单交易单
        *getETBigTradeLog({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getETBigTradeLog + payload.code, 'post', payload);
                //  alert('getETBigTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETBigTradeLog', payload: { etBigTradeLog:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET 根据账号分页获取用户最新交易单
        *getETTradeLogByAccount({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getETTradeLogByAccount, 'post', payload);
                // alert('getETTradeLogByAccount: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETTradeLog', payload: { etTradeLog:resp.data } });
                    Constants.netTimeoutFlag=false;
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET 取余额
        *getETBalance({payload, callback}, {call, put}){
            try{
                const resp = yield call(Request.request, getBalance, 'post', payload);
                // alert('getETBalance: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    // yield put({ type: 'updateETTradeLog', payload: { etTradeLog:resp.data } });
                }else{
                    EasyToast.show(resp.msg);
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
    },

    reducers : {
        updateInfo(state, action) {      
            return { ...state, ...action.payload };
        },
        updateRamPriceLine(state, action) {      
            let ramLineDatas = combine(action.payload.data);
            return { ...state, ramLineDatas };
        },
        clearRamPriceLine(state, action) {
            let ramLineDatas = null;
            return { ...state, ramLineDatas };
        },
        updateTradeLog(state, action) {
            return { ...state, ...action.payload };
        },
        updateBigTradeLog(state, action) {
            return { ...state, ...action.payload };
        },
        updateBigRamRank(state, action) {
            return { ...state, ...action.payload };
        },
        updateETList(state, action) {
            return { ...state, ...action.payload };
        },
        updateETInfo(state, action) {
            return { ...state, ...action.payload };
        },
        updateETPriceLine(state, action) {      
            let etLineDatas = combineET(action.payload.data);
            return { ...state, etLineDatas };
        },
        updateETTradeLog(state, action) {
            return { ...state, ...action.payload };
        },
        updateETBigTradeLog(state, action) {
            return { ...state, ...action.payload };
        },
    }
  }

  function combine(data) {
    return  {
        // color: ['#556E95','#6CDAFF'],
        backgroundColor: "#2f3b50",
        grid: {
            top: '15%',
            left: '0%',
            right: '5%',
            bottom: '3%',
            height: '82%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisTick: {
                    alignWithLabel: true
                },
                axisTick: {
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: "#7382a1"
                    }
                },
                axisLabel: {
                    color: "#96BAF0"
                },
            }
        ],
        yAxis: [
            {
                name: 'EOS/KB',
                nameLocation: 'end',      
                nameRotate: '0',
                nameGap: '10', 
                min: 'dataMin',
                max: 'dataMax',
                show: true,
                type: 'value',
                splitLine: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: "#7382a1"
                    }
                },
                axisTick: {
                    show: true,
                    // interval: '0'
                },
                axisLabel: {
                    show: true,
                    // formatter: '{value}',
                    formatter: function(value, index) {
                        if(value == null || value == ''){
                            return '0.000';
                        }
                        return value.toFixed(3);
                    },
                    color: "#93B5EE",
                    // interval: '0'
                },
            },
        ],
        series: [
            {
                yAxisIndex: 0,
                name: '交易量',
                type: 'line',
                barWidth: '50%',
                data: data.ps,
                lineStyle: {
                    normal: {
                        width: 1,  //连线粗细
                        color: "#6CDAFF"  //连线颜色
                    }
                },
                smooth: true,//折线图是趋缓的
            },
 
        ]
    }
}

function combineET(data) {
    return  {
        // color: ['#556E95','#6CDAFF'],
        backgroundColor: "#2f3b50",
        grid: {
            top: '15%',
            left: '0%',
            right: '5%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisTick: {
                    alignWithLabel: true
                },
                axisTick: {
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: "#7382a1"
                    }
                },
                axisLabel: {
                    color: "#96BAF0"
                },
            }
        ],
        yAxis: [
            {
                name: 'EOS',
                nameLocation: 'end',      
                nameRotate: '0',
                nameGap: '10', 
                min: 'dataMin',
                max: 'dataMax',
                show: true,
                type: 'value',
                splitLine: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: "#7382a1"
                    }
                },
                axisTick: {
                    show: true,
                    // interval: '0'
                },
                axisLabel: {
                    show: true,
                    // formatter: '{value}',
                    // formatter: function(value, index) {
                    //     if(value == null || value == ''){
                    //         return '0.000';
                    //     }
                    //     return value.toFixed(8);
                    // },
                    formatter: function(value, index) {
                        if(value == null || value == ''){
                            return parseFloat('0').toExponential(2);
                        }
                        return parseFloat(value).toExponential(2);
                    },
                    color: "#93B5EE",
                    // interval: '0'
                },
            },
        ],
        series: [
            {
                yAxisIndex: 0,
                name: '交易量',
                type: 'line',
                barWidth: '50%',
                data: data.ps,
                lineStyle: {
                    normal: {
                        width: 2,  //连线粗细
                        color: "#6CDAFF"  //连线颜色
                    }
                },
                smooth: true,//折线图是趋缓的
            },
 
        ]
    }
}
  