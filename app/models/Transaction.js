import Request from '../utils/RequestUtil';
import {getRamInfo, getRamPriceLine, getRamTradeLog, getRamBigTradeLog, getRamTradeLogByAccount, getBigRamRank,
    getRamKLines,getETList,getETInfo,getETPriceLine,getETKLine,getETTradeLog,getETBigTradeLog,getETTradeLogByAccount,getBalance} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import UColor from '../utils/Colors'
import Constants from '../utils/Constants'
let newarr = new Array();

export default {
    namespace: 'transaction',
    state: {
    ramTradeLog:{},
    personalRamTradeLog:{},
    myRamTradeLog: {},
    },
    effects: {
        *getRamInfo({payload,callback},{call,put}) {
            var ramInfoInCache = yield call(store.get, "ramInfo");
            try{
                const resp = yield call(Request.request, getRamInfo, 'post', payload);
                if(resp.code=='0'){               
                    yield put({ type: 'updateInfo', payload: { ramInfo:resp.data } });
                    yield call(store.save, "ramInfo", resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    yield put({ type: 'updateInfo', payload: { ramInfo:ramInfoInCache } });
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                yield put({ type: 'updateInfo', payload: { ramInfo:ramInfoInCache } });
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
        *getRamPriceLine({payload,callback},{call,put}) {
            var ramPriceLineInCache = yield call(store.get, "ramPriceLine");
            try{
                const resp = yield call(Request.request, getRamPriceLine + payload.type, 'post', payload);
                // alert("getRamPriceLine : " + JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateRamPriceLine', payload: { data: resp.data, ...payload } });
                    yield call(store.save, "ramPriceLine", resp);
                }else{
                    EasyToast.show(resp.msg);
                    if(ramPriceLineInCache){
                        yield put({ type: 'updateRamPriceLine', payload: { data: ramPriceLineInCache.data, ...payload } });
                        if (callback) callback(ramPriceLineInCache);
                    }else{
                        if (callback) callback(resp);
                    }
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(ramPriceLineInCache){
                    yield put({ type: 'updateRamPriceLine', payload: { data: ramPriceLineInCache.data, ...payload } });
                    if (callback) callback(ramPriceLineInCache);
                }else{
                    if (callback) callback({ code: 500, msg: "网络异常" });                
                }          
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
            var ramTradeLogInCache = yield call(store.get, "ramTradeLog");

            try{
                const resp = yield call(Request.request, getRamTradeLog, 'post', payload);
                // alert('getRamTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateTradeLog', payload: { data:resp.data, ...payload } });
                    yield call(store.save, "ramTradeLog", resp);
                    if (callback) callback(resp);                
                }else{
                    EasyToast.show(resp.msg);
                    if(ramTradeLogInCache && ramTradeLogInCache.data){
                        yield put({ type: 'updateTradeLog', payload: { data:ramTradeLogInCache.data, ...payload } });
                        if (callback) callback(ramTradeLogInCache); 
                    }else{
                        if (callback) callback(resp);                
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(ramTradeLogInCache && ramTradeLogInCache.data){
                    yield put({ type: 'updateTradeLog', payload: { data:ramTradeLogInCache.data, ...payload } });
                    if (callback) callback(ramTradeLogInCache); 
                }else{
                    if (callback) callback({ code: 500, msg: "网络异常" });                
                }             
            }
        },
        *getRamBigTradeLog({ payload, callback }, { call, put }) {
            var ramBigTradeLogInCache = yield call(store.get, "ramBigTradeLog");
            try{
                const resp = yield call(Request.request, getRamBigTradeLog, 'post', payload);
                // alert('getRamBigTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateBigTradeLog', payload: { ramBigTradeLog:resp.data } });
                    yield call(store.save, "ramBigTradeLog", resp);
                    if (callback) callback(resp);                
                }else{
                    EasyToast.show(resp.msg);
                    if(ramBigTradeLogInCache){
                        yield put({ type: 'updateBigTradeLog', payload: { ramBigTradeLog:ramBigTradeLogInCache.data } });
                        if (callback) callback(ramBigTradeLogInCache);                
                    }else{
                        if (callback) callback(resp);                
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(ramBigTradeLogInCache){
                    yield put({ type: 'updateBigTradeLog', payload: { ramBigTradeLog:ramBigTradeLogInCache.data } });
                    if (callback) callback(ramBigTradeLogInCache); 
                }else{
                    if (callback) callback({ code: 500, msg: "网络异常" });                
                }
            }
        },
        *getMyRamTradeLog({ payload, callback }, { call, put }) {
            var myRamTradeLogInCache = yield call(store.get, "myRamTradeLog");

            try{
                const resp = yield call(Request.request, getRamTradeLogByAccount, 'post', payload);
                // alert('getRamTradeLogByAccount: '+JSON.stringify(resp));
                if(resp && resp.code=='0'){               
                    yield put({ type: 'updateMyTradeLog', payload: { data:resp.data, ...payload  } });
                    yield call(store.save, "myRamTradeLog", resp);
                    if (callback) callback(resp);                        
                }else{
                    EasyToast.show(resp.msg);
                    if(myRamTradeLogInCache){
                        if (callback) callback(myRamTradeLogInCache);                
                    }else{
                        if (callback) callback(resp);                
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(myRamTradeLogInCache){
                    if (callback) callback(myRamTradeLogInCache);                
                }else{
                    if (callback) callback({ code: 500, msg: "网络异常" });                
                }
            }
        },
        //个人交易记录查询
        *getRamTradeLogByAccount({ payload, callback }, { call, put }) {
            try{
                const resp = yield call(Request.request, getRamTradeLogByAccount, 'post', payload);
                // alert('getRamTradeLogByAccount: '+JSON.stringify(resp));
                if(resp && resp.code=='0'){               
                    yield put({ type: 'updatePersonalTradeLog', payload: { data:resp.data, ...payload  } });
                    
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
            var bigRamRankInCache = yield call(store.get, "bigRamRank");

            try{
                const resp = yield call(Request.request, getBigRamRank, 'get');
                // alert('getBigRamRank: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateBigRamRank', payload: { bigRamRank:resp.data } });
                    yield call(store.save, "bigRamRank", resp);
                    if (callback) callback(resp); 
                }else{
                    EasyToast.show(resp.msg);
                    if(bigRamRankInCache){
                        yield put({ type: 'updateBigRamRank', payload: { bigRamRank:bigRamRankInCache.data } });
                        if (callback) callback(bigRamRankInCache);                
                    }else{
                        if (callback) callback(resp);                
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(bigRamRankInCache){
                    yield put({ type: 'updateBigRamRank', payload: { bigRamRank:bigRamRankInCache.data } });
                    if (callback) callback(bigRamRankInCache);                
                }else{
                    if (callback) callback({ code: 500, msg: "网络异常" });                
                }
            }
        },
        //ramK线图
        *getRamKLines({ payload, callback }, { call, put }) {
            var ramPriceKLine = yield call(store.get, "ramPriceKLine");

            try{
                const resp = yield call(Request.request, getRamKLines, 'post', payload);
                //  alert('getRamKLines: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    // yield put({ type: 'updateRamPriceLine', payload: { data: resp.data, ...payload } });
                    yield call(store.save, "ramPriceKLine", resp);
                    if (callback) callback(resp);                
                }else{
                    EasyToast.show(resp.msg);
                    if(ramPriceKLine){
                        if (callback) callback(ramPriceKLine);                
                    }else{
                        if (callback) callback(resp);                
                    }
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(ramPriceKLine){
                    if (callback) callback(ramPriceKLine);                
                }else{
                    if (callback) callback({ code: 500, msg: "网络异常" });                
                }            
            }
        },

        //ET交易所接口
        //交易列表
        *getETList({payload,callback},{call,put}) {
            var etListInCache = yield call(store.get, "etList");
            try{
                const resp = yield call(Request.request, getETList, 'get');
                //  alert('getETList: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETList', payload: { etlist:resp.data } });
                    yield call(store.save, "etList", resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etListInCache){
                        yield put({ type: 'updateETList', payload: { etlist:etListInCache } });
                    }
                }
                if (callback) callback(resp); 

            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etListInCache){
                    yield put({ type: 'updateETList', payload: { etlist:etListInCache } });
                }
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
          },
        //获取币信息
        *getETInfo({payload,callback},{call,put}) {
            var etInfoInCache = yield call(store.get, "etInfo_"+payload.code);
            try{
                const resp = yield call(Request.request, getETInfo + payload.code, 'get');
                // alert('getETInfo: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETInfo', payload: { etinfo:resp.data } });
                    yield call(store.save, "etInfo_"+payload.code, resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etInfoInCache){
                        yield put({ type: 'updateETInfo', payload: { etinfo:etInfoInCache } });
                    }
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etInfoInCache){
                    yield put({ type: 'updateETInfo', payload: { etinfo:etInfoInCache } });
                }
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //et时分图
        *getETPriceLine({payload,callback},{call,put}) {
            var etLineInCache = yield call(store.get, "etLine_"+payload.code+"_"+payload.type);
            try{
                const resp = yield call(Request.request, getETPriceLine + payload.code + '/' + payload.type, 'post', payload);
                // alert("getETPriceLine : " + JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETPriceLine', payload: { data: resp.data, ...payload } });
                    yield call(store.save, "etLine_"+payload.code+"_"+payload.type, resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etLineInCache){
                        yield put({ type: 'updateETPriceLine', payload: { data: etLineInCache, ...payload } });
                    }
                }
                if (callback) callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etLineInCache){
                    yield put({ type: 'updateETPriceLine', payload: { data: etLineInCache, ...payload } });
                }
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //et K线图
        *getETKLine({ payload, callback }, { call, put }) {
            var etKLineInCache = yield call(store.get, "etKLine_"+payload.code+"_"+payload.dateType);
            try{
                const resp = yield call(Request.request, getETKLine, 'post', payload);
                // alert('getETKLine: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETKLine', payload: { etKLine: resp.data, ...payload } });
                    yield call(store.save, "etKLine_"+payload.code+"_"+payload.dateType, resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etKLineInCache){
                        yield put({ type: 'updateETKLine', payload: { etKLine: etKLineInCache, ...payload } });
                    }
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etKLineInCache){
                    yield put({ type: 'updateETKLine', payload: { etKLine: etKLineInCache, ...payload } });
                }
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET获取最新交易单
        *getETTradeLog({ payload, callback }, { call, put }) {
            var etTradeLogInCache =yield call(store.get, "etTradeLog_"+payload.code);
            try{
                const resp = yield call(Request.request, getETTradeLog + payload.code, 'post', payload);
                // alert('getETTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETTradeLog', payload: { etTradeLog:resp.data } });
                    yield call(store.save, "etTradeLog_"+payload.code, resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etTradeLogInCache){
                        yield put({ type: 'updateETTradeLog', payload: { etTradeLog:etTradeLogInCache } });
                    }
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etTradeLogInCache){
                    yield put({ type: 'updateETTradeLog', payload: { etTradeLog:etTradeLogInCache } });
                }
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET获取大单交易单
        *getETBigTradeLog({ payload, callback }, { call, put }) {
            var etBigTradeLogInCache = yield call(store.get, "etBigTradeLog_" + payload.code);
            try{
                const resp = yield call(Request.request, getETBigTradeLog + payload.code, 'post', payload);
                //  alert('getETBigTradeLog: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETBigTradeLog', payload: { etBigTradeLog:resp.data } });
                    yield call(store.save, "etBigTradeLog_" + payload.code, resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etBigTradeLogInCache){
                        yield put({ type: 'updateETBigTradeLog', payload: { etBigTradeLog: etBigTradeLogInCache } });
                    }
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etBigTradeLogInCache){
                    yield put({ type: 'updateETBigTradeLog', payload: { etBigTradeLog: etBigTradeLogInCache } });
                }
                if (callback) callback({ code: 500, msg: "网络异常" });                
            }
        },
        //ET 根据账号分页获取用户最新交易单
        *getETTradeLogByAccount({ payload, callback }, { call, put }) {
            var etTradeLogByAccountInCache = yield call(store.get, "etTradeLogByAccount" );
            try{
                const resp = yield call(Request.request, getETTradeLogByAccount, 'post', payload);
                // alert('getETTradeLogByAccount: '+JSON.stringify(resp));
                if(resp.code=='0'){               
                    yield put({ type: 'updateETTradeLog', payload: { etTradeLog:resp.data } });
                    yield call(store.save, "etTradeLogByAccount", resp.data);
                }else{
                    EasyToast.show(resp.msg);
                    if(etTradeLogByAccountInCache){
                        yield put({ type: 'updateETTradeLog', payload: { etTradeLog:etTradeLogByAccountInCache } });
                    }
                }
                if (callback) callback(resp);                
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
                if(etTradeLogByAccountInCache){
                    yield put({ type: 'updateETTradeLog', payload: { etTradeLog:etTradeLogByAccountInCache } });
                }
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
            let ramTradeLog = state.ramTradeLog;
            if(action.payload.data == null || action.payload.last_id=="-1" || ramTradeLog == null){
                ramTradeLog=action.payload.data;
            }else{
                ramTradeLog = ramTradeLog.concat(action.payload.data);
            }
            return {...state,ramTradeLog};
        },
        updatePersonalTradeLog(state, action) {
            let personalRamTradeLog = state.personalRamTradeLog;
            if(action.payload.data == null || action.payload.last_id=="-1" || personalRamTradeLog == null){
                personalRamTradeLog=action.payload.data;
            }else{
                personalRamTradeLog = personalRamTradeLog.concat(action.payload.data);
            }
            return {...state,personalRamTradeLog};
        },
        updateMyTradeLog(state, action) {
            let myRamTradeLog = state.myRamTradeLog;
            if(action.payload.data == null || action.payload.last_id=="-1" || myRamTradeLog == null){
                myRamTradeLog=action.payload.data;
            }else{
                myRamTradeLog = myRamTradeLog.concat(action.payload.data);
            }
            return {...state,myRamTradeLog};
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
        updateETKLine(state, action) {      
            return { ...state, ...action.payload };
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
        // color: ['#556E95','#65CAFF'],
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
                        color: '#8696B0',
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
                        color: '#8696B0',
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
                        color: '#65CAFF', //连线颜色
                    }
                },
                smooth: true,//折线图是趋缓的
            },
 
        ]
    }
}

function combineET(data) {
    return  {
        // color: ['#556E95','#65CAFF'],
        backgroundColor: "#2f3b50",
        grid: {
            top: '15%',
            left: '5%',
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
                        color: '#8696B0',
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
                        color: '#8696B0',
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
                        width: 1,  //连线粗细
                        color:   '#65CAFF', //连线颜色
                    }
                },
                smooth: true,//折线图是趋缓的
            },
 
        ]
    }
}
  