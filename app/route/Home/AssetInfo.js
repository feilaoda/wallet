import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, RefreshControl, Text, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from '../../components/EasyShow'
import BaseComponent from "../../components/BaseComponent";
import moment from 'moment';

@connect(({ wallet, assets}) => ({ ...wallet, ...assets }))
class AssetInfo extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.asset.asset.name,
            headerStyle: {
                paddingTop: ScreenUtil.autoheight(20),
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
        };
    };

     // 构造函数  
     constructor(props) {
        super(props);
        this.state = {
            balance: this.props.navigation.state.params.asset.balance,
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            type: '',
            asset: this.props.navigation.state.params.asset,
            // detailInfo: "请稍候...",
            logRefreshing: false,
            logId: "-1",
        };
        DeviceEventEmitter.addListener('transaction_success', () => {
            try {
                this.getBalance();
                DeviceEventEmitter.emit('wallet_info');
            } catch (error) {
            }
        });
    }

    componentWillMount() {

        super.componentWillMount();
    
        this.props.dispatch({type: 'assets/clearTradeDetails',payload:{}});
    }

    componentDidMount() {
        try {
            this.setState({logRefreshing: true});
            //加载地址数据
            // EasyShowLD.loadingShow();
            this.props.dispatch({ type: 'wallet/getDefaultWallet' });

            this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: "-1", countPerPage: 10}, callback: (resp) => {
                this.setState({logRefreshing: false});
                this.processResult();
            }});  
        } catch (error) {
            this.setState({logRefreshing: false});
        }
   
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
    }

    processResult(){
        if(this.props.tradeLog && (this.props.tradeLog.length > 0)){
            this.setState({logId: this.props.tradeLog[this.props.tradeLog.length - 1]._id});
        }else{
            this.setState({logId: "-1"});
        }
        // if(resp == null || resp.code == null){
        //     return;
        // }
        // if(resp.code != '0'){
        //     // this.setState({detailInfo: "暂未找到交易哟~"});
        // }else if((resp.code == '0') && (this.props.tradeLog.length == 0)){
        //     this.setState({logId: this.props.tradeLog[tradeLog.length - 1]._id});
        // }else if((resp.code == '0') && (this.props.tradeLog.length > 0)){
        //     this.setState({logId: this.props.tradeLog[tradeLog.length - 1]._id});
        // }
    }

    turnInAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnInAsset', {coins, balance: this.state.balance });
    }
    turnOutAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnOutAsset', { coins, balance: this.state.balance });
    }

    getBalance() {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: this.props.navigation.state.params.asset.asset.contractAccount, account: this.props.defaultWallet.name, symbol: this.props.navigation.state.params.asset.asset.name }, callback: (data) => {
              if (data.code == '0') {
                if (data.data == "") {
                  this.setState({
                    balance: '0.0000 ' + this.props.navigation.state.params.asset.asset.name,
                  })
                } else {
                    this.setState({ balance: data.data });
                }
              } else {
                // EasyToast.show('获取余额失败：' + data.msg);
              }
              EasyShowLD.loadingClose();
            }
          })
    }

    _openDetails(trade) {  
        const { navigate } = this.props.navigation;
        navigate('TradeDetails', {trade});
    }
    transferTimeZone(blockTime){
        var timezone;
        try {
            timezone = moment(blockTime).add(8,'hours').format('YYYY-MM-DD HH:mm');
        } catch (error) {
            timezone = blockTime;
        }
        return timezone;
    }

    onEndReached(){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
          return;
        }
    
        if(this.state.logRefreshing || this.state.logId == "-1"){
            return;
        }
        this.setState({logRefreshing: true});
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: this.state.logId, countPerPage: 10}, callback: (resp) => {
            this.processResult();
            this.setState({logRefreshing: false});
        }}); 
    }

    onRefresh(){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
          return;
        }
    
        if(this.state.logRefreshing){
            return;
        }
        this.setState({logRefreshing: true});
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, last_id: "-1", countPerPage: 10}, callback: (resp) => {
            this.processResult();
            this.setState({logRefreshing: false});
        }}); 
    }

    render() {
        const c = this.props.navigation.state.params.asset;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headbalance}>{this.state.balance==""? "0.0000" :this.state.balance.replace(c.asset.name, "")} {c.asset.name}</Text>
                    <Text style={styles.headmarket}>≈ {(this.state.balance == null || c.asset.value == null) ? "0.00" : (this.state.balance.replace(c.asset.name, "") * c.asset.value).toFixed(2)} ￥</Text>
                </View>
                <View style={styles.btn}>
                    <Text style={styles.latelytext}>最近交易记录</Text>
                    {/* {(this.props.tradeLog == null || this.props.tradeLog.length == 0) && <View style={styles.nothave}><Text style={styles.copytext}>{this.state.detailInfo}</Text></View>} */}
                    <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} onEndReachedThreshold = {50}
                    onEndReached={() => this.onEndReached()}
                    refreshControl={
                    <RefreshControl
                        refreshing={this.state.logRefreshing}
                        onRefresh={() => this.onRefresh()}
                        tintColor={UColor.fontColor}
                        colors={[UColor.lightgray, UColor.tintColor]}
                        progressBackgroundColor={UColor.fontColor}
                    />
                    }
                    dataSource={this.state.dataSource.cloneWithRows(this.props.tradeLog == null ? [] : this.props.tradeLog)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <Button onPress={this._openDetails.bind(this,rowData)}> 
                            <View style={styles.row}>
                                <View style={styles.top}>
                                    <View style={styles.timequantity}>
                                        <Text style={styles.timetext}>时间 : {this.transferTimeZone(rowData.blockTime)}</Text>
                                        <Text style={styles.quantity}>数量 : {rowData.quantity.replace(c.asset.name, "")}</Text>
                                    </View>
                                    {(rowData.blockNum == null || rowData.blockNum == '') ? 
                                        <View style={styles.unconfirmedout}>
                                            {/* <Image source={UImage.unconfirm} style={styles.shiftturn} /> */}
                                            <Text style={styles.unconfirmed}>未确认...</Text>
                                        </View>
                                            :
                                        <View style={styles.typedescription}>
                                            {rowData.type == '转出' ? 
                                            <Text style={styles.typeto}>类型 : {rowData.type}</Text>
                                            :
                                            <Text style={styles.typeout}>类型 : {rowData.type}</Text>
                                            }
                                            <Text style={styles.description}>（{rowData.description}）</Text>
                                        </View>
                                    }
                                </View>
                                <View style={styles.Ionicout}>
                                    <Ionicons color={UColor.arrow} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </Button>  
                    </View>         
                     )}                
                 /> 
                </View>

                <View style={styles.footer}>
                    <Button onPress={this.turnInAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={styles.shiftshiftturnout}>
                            <Image source={UImage.shift_to} style={styles.shiftturn} />
                            <Text style={styles.shifttoturnout}>转入</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnOutAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={styles.shiftshiftturnout}>
                            <Image source={UImage.turn_out} style={styles.shiftturn} />
                            <Text style={styles.shifttoturnout}>转出</Text>
                        </View>
                    </Button>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop: ScreenUtil.autoheight(5),
    },
    header: {
        height: ScreenUtil.autoheight(110),
        justifyContent: "center",
        alignItems: "center",
        margin: ScreenUtil.autowidth(5),
        borderRadius: 5,
        backgroundColor: UColor.mainColor,
    },
    headbalance: {
        fontSize: ScreenUtil.setSpText(20), 
        color: UColor.fontColor
    },
    headmarket: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        marginTop: ScreenUtil.autowidth(5)
    },

    tab: {
        flex: 1,
    },
    btn: {
        flex: 1,
        paddingBottom: ScreenUtil.autoheight(60),
    },

    latelytext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        margin: ScreenUtil.autowidth(5),
    },
    nothave: {
        height: ScreenUtil.autoheight(80),
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        paddingHorizontal: ScreenUtil.autowidth(20),
        borderRadius: 5,
        margin: ScreenUtil.autowidth(5),
    },
    row: {
        borderRadius: 5,
        flexDirection: "row",
        backgroundColor: UColor.mainColor,
        paddingHorizontal: ScreenUtil.autowidth(20),
        paddingVertical: ScreenUtil.autoheight(5),
        marginHorizontal: ScreenUtil.autowidth(5),
        marginVertical: ScreenUtil.autowidth(2.5),
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
    },
    timequantity: {
        flex: 1,
        height: ScreenUtil.autoheight(60),
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: 'flex-start',
    },
    timetext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        textAlign: 'left'
    },
    quantity: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        textAlign: 'left',
    },
    description: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        textAlign: 'center',
        marginTop: ScreenUtil.autoheight(3),
    },
    unconfirmedout: { 
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: 'center'
    },
    unconfirmed: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.showy,
        textAlign: 'center',
        marginTop: 3
    },
    typedescription: {
        height: ScreenUtil.autoheight(60),
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: 'center'
    },
    typeto: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.tintColor,
        textAlign: 'center'
    },
    typeout: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.fallColor,
        textAlign: 'center'
    },

    Ionicout: {
        width: ScreenUtil.autowidth(30),
        justifyContent: 'center',
        alignItems: 'flex-end'
    },

    footer: {
        paddingTop: ScreenUtil.autoheight(1),
        height: ScreenUtil.autoheight(60),
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: UColor.secdColor,
        bottom: 0,
        left: 0,
        right: 0,
    },
    shiftshiftturnout: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginRight: 1,
        backgroundColor: UColor.mainColor,
    },
    shiftturn: {
        width: ScreenUtil.autowidth(30), 
        height: ScreenUtil.autowidth(30),
    },
    shifttoturnout: {
        marginLeft: ScreenUtil.autowidth(20),
        fontSize: ScreenUtil.setSpText(18),
        color: UColor.fontColor
    },
    copytext: {
        fontSize: ScreenUtil.setSpText(16), 
        color: UColor.fontColor
    },

})
export default AssetInfo;