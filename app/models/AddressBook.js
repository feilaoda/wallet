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
        *addressInfo({ payload }, { call, put }) {
            try {
                    let addressBook = yield call(store.get, 'addressBook');
                    yield put({ type: 'updateAction', payload: { data: addressBook, ...payload } });

            } catch (error) {
                EasyToast.show('刷新失败!');
            }
        },
        *saveAddress({ payload,callback}, { call, put }) {
            var addressBook = yield call(store.get, 'addressBook');        
            if (addressBook == null) {
                addressBook = [];              
            }

            for (var i = 0; i < addressBook.length; i++) {
                if (addressBook[i].labelName == payload.labelName) {
                    EasyToast.show('标签名称已存在！');
                    return;
                }
            }

            var _address = {
                labelName: payload.labelName,
                address: payload.address,               
            }         
            addressBook[addressBook.length] = _address;
            yield call(store.save, 'addressBook', addressBook);
            yield put({ type: 'updateAction', payload: { data: addressBook, ...payload } });
            if(callback) callback(addressBook);
        },
        // *addressList({ payload }, { call, put }) {
        //     const walletArr = yield call(store.get, 'walletArr');
        //     // alert('walletArr'+JSON.stringify(walletArr));
        //     yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });
        // }, 
        *delAddress({ payload }, { call, put }) {          
            var addressBook = yield call(store.get, 'addressBook');
            for (var i = payload.keyArr.length; i > 0 ; i--) {
                addressBook.splice(payload.keyArr[i-1], 1);
                yield call(store.save, 'addressBook', addressBook);
                yield put({ type: 'update', payload: { data: addressBook, ...payload } });
                EasyToast.show('删除成功，点击完成刷新');
            }

            // var myAddressBook = yield call(store.get, 'addressBook');        
            // if (myAddressBook == null) {
            //     return;
            // }
            // for (var i = 0; i < myAddressBook.length; i++) {
            //     if (myAddressBook[i].labelName == payload.labelName) {
            //         myAddressBook.splice(i, 1);
            //         yield call(store.save, 'addressBook', myAddressBook);
            //         yield put({ type: 'updateAction', payload: { data: myAddressBook, ...payload } });
            //         if(callback) callback(myAddressBook);
            //         return;
            //     }
            // }
            return;
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