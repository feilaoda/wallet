import Request from '../utils/RequestUtil';
import { address } from '../utils/Api';
import { EasyToast } from '../components/Toast';
import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import { DeviceEventEmitter } from 'react-native';


export default {
    namespace: 'addressBook',
    state: {
        list: [],
        total: {},
        totalOpt: {}
    },
    effects: {
        *info({ payload }, { call, put }) {
            try {
               
                    let addressBook = yield call(store.get, 'addressBook');
                    yield put({ type: 'updateAction', payload: { data: addressBook, ...payload } });
                    // yield put({ type: 'update', payload: { addressBook : addressBook } });
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *saveAddress({ payload }, { call, put }) {
            var addressBook = yield call(store.get, 'addressBook');        
            if (addressBook == null) {
                addressBook = [];              
            }

            // wallet = JSON.parse(wallet);

            // var _account = "account" + addressBook.length;
            // alert(4);
        
            var _address = {
                labelname: payload.labelname,
                address: payload.address,               
            }         
            addressBook[addressBook.length] = _address;
            yield call(store.save, 'addressBook', addressBook);
            yield put({ type: 'updateAction', payload: { data: addressBook, ...payload } });
        },
        *walletList({ payload }, { call, put }) {
            const walletArr = yield call(store.get, 'walletArr');
            // alert('walletArr'+JSON.stringify(walletArr));
            yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });

        }, 
        *delWallet({ payload }, { call, put }) {          
            var walletArr = yield call(store.get, 'addressBook');
            for (var i = payload.keyArr.length; i > 0 ; i--) {
                walletArr.splice(payload.keyArr[i-1], 1);
                yield call(store.save, 'addressBook', walletArr);
                yield put({ type: 'update', payload: { data: walletArr, ...payload } });
                EasyToast.show('删除成功，点击完成刷新');
            }
        }
    },
    reducers: {
        update(state, action) {
            return {...state,...action.payload};
        },
        updateAction(state, action) {
            let addressBook = action.payload.data;
            return { ...state, addressBook };
        },
    }
}