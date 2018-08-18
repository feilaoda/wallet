import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,ListView,StyleSheet,View,Text,Image,Platform,TextInput,TouchableOpacity} from 'react-native';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { Eos } from "react-native-eosjs";
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Imvote extends BaseComponent {
 
    static navigationOptions =  {
        title: "我的投票",
        headerStyle: {
            paddingTop: ScreenUtil.autoheight(20),
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
        },      
    };

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            show: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
            votelist: [],
        };
    }

    componentDidMount() {
        EasyShowLD.loadingShow();
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {     
                this.props.dispatch({ type: 'vote/list', payload: { page:1}, callback: (data) => {
                    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account} });
                    EasyShowLD.loadingClose();
                }});
            }
        }) 
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount(); 
    }

    unapprove = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }

        if(!this.props.producers || this.props.producers.length <=0){
            EasyToast.show('您还未投票');
            return;
        }

        var selectArr= [];
        for(var i = 0; i < this.props.producers.length; i++){
            selectArr.push(this.props.producers[i].account);
        }
        const { dispatch } = this.props;
        this.props.voteData.forEach(element => {
            if(element.isChecked){
                selectArr.splice(selectArr.indexOf(element.account), 1);
            }
        });
        selectArr.sort();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
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
                    //撤票
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'voteproducer',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    voter: this.props.defaultWallet.account,
                                    proxy: '',
                                    producers:  selectArr, //["producer111f"]
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyShowLD.loadingClose();
                        if(r.data && r.data.transaction_id){
                            this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account} });
                            EasyToast.show("撤票成功");
                        }else{
                            var errmsg = "撤票失败: "+ r.data.msg;
                            EasyToast.show(errmsg);
                        }
                    }); 
                } else {
                    EasyShowLD.loadingClose();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyShowLD.loadingClose();
                EasyToast.show('密码错误');
            }
        }, () => { EasyShowLD.dialogClose() });
    };


    selectItem = (item) => { // 单选
        this.props.dispatch({ type: 'vote/up', payload: { item:item} });
    }

    _openAgentInfo(coins) {
        const { navigate } = this.props.navigation;
        navigate('AgentInfo', {coins});
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headout}>         
                    <Text style={styles.nodename}>节点名称</Text>           
                    <Text style={styles.rankingticket}>排名/票数</Text>           
                    <Text style={styles.choice}>选择</Text>          
                </View>
                <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.producers == null ? [] : this.props.producers)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <Button onPress={this._openAgentInfo.bind(this,rowData)}> 
                            <View style={styles.outsource} backgroundColor={(parseInt(rowID)%2 == 0) ? UColor.secdColor : UColor.inash}>
                                <View style={styles.logview}>
                                   <Image source={rowData.icon==null ? UImage.eos : {uri: rowData.icon}} style={styles.logimg}/>
                                </View>
                                <View style={styles.nameregion}>
                                    <Text style={styles.nameranking} numberOfLines={1}>{rowData.name}</Text>
                                    <Text style={styles.regiontotalvotes} numberOfLines={1}>地区：{rowData.region==null ? "未知" : rowData.region}</Text>
                                </View>
                                <View style={styles.rankvote}>
                                    <Text style={styles.nameranking}>{rowData.ranking}</Text>
                                    <Text style={styles.regiontotalvotes}>{parseInt(rowData.total_votes)}</Text>
                                </View>
                                <TouchableOpacity style={styles.taboue} onPress={ () => this.selectItem(rowData)}>
                                    <View style={styles.tabview} >
                                        <Image source={rowData.isChecked ? UImage.Tick:null} style={styles.tabimg} />
                                    </View>  
                                </TouchableOpacity>  
                            </View> 
                        </Button>  
                    </View>         
                    )}                   
                />               
                <View style={styles.footer}>
                    <Button  style={styles.btn}>
                        <View style={styles.btnnode}>
                            <Text style={styles.nodenumber}>{this.props.producers == null ? 30 : 30 - this.props.producers.length}</Text>
                            <Text  style={styles.nodetext}>剩余可投票数</Text>
                        </View>
                    </Button>
                    <Button onPress={this.unapprove.bind(this)} style={styles.btn}>
                        <View style={styles.btnvote}>
                            <Image source={UImage.vote_h} style={styles.voteimg} />
                            <Text style={styles.votetext}>撤票</Text>
                        </View>
                    </Button>
                </View>  
            </View>
        );
    }
};


const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: ScreenUtil.autoheight(45),
        width: ScreenWidth-100,
        fontSize: ScreenUtil.setSpText(16),
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },
    inptpasstext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        lineHeight: ScreenUtil.autoheight(20),
        marginTop: ScreenUtil.autowidth(10),
    },

    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },
    headout: {
        flexDirection: 'row', 
        backgroundColor: UColor.mainColor,
        height: ScreenUtil.autoheight(25),
    },
    nodename:{
        width: ScreenUtil.autowidth(140),  
        color: UColor.fontColor, 
        fontSize: ScreenUtil.setSpText(16),  
        textAlign:'center', 
        lineHeight: ScreenUtil.autoheight(25),
    },
    rankingticket: {
        flex: 1,
        color: UColor.fontColor,
        fontSize: ScreenUtil.setSpText(16),
        textAlign: 'center',
        lineHeight: ScreenUtil.autoheight(25),
    },
    choice: {
        width: ScreenUtil.autowidth(50),
        color: UColor.fontColor,
        fontSize: ScreenUtil.setSpText(16),
        textAlign: 'center',
        lineHeight: ScreenUtil.autoheight(25),
    },

    outsource: {
        flexDirection: 'row', 
        height: ScreenUtil.autoheight(60),
        paddingVertical: ScreenUtil.autoheight(10),
    },
    logview: {
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    logimg: {
        width: ScreenUtil.autowidth(30), 
        height: ScreenUtil.autowidth(30), 
        margin: ScreenUtil.autowidth(10),
    },
    nameregion: {
        width: ScreenUtil.autowidth(100),
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    rankvote: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nameranking: {
        color: UColor.fontColor, 
        fontSize: ScreenUtil.setSpText(14),
    }, 
    regiontotalvotes: {
        color: UColor.lightgray,
        fontSize: ScreenUtil.setSpText(14),
    },

    taboue: {
        justifyContent: 'center', 
        alignItems: 'center',
    },
    tabview: {
        width: ScreenUtil.autowidth(27),
        height: ScreenUtil.autowidth(27),
        margin: ScreenUtil.autowidth(5),
        borderColor: UColor.lightgray,
        borderWidth: 1,
    },
    tabimg: {
        width: ScreenUtil.autowidth(25), 
        height: ScreenUtil.autowidth(25),
    },

    footer: {
      height: ScreenUtil.autoheight(50),
      flexDirection: 'row',
      backgroundColor: UColor.secdColor,  
    },
    btn: {
        flex: 1
    },
    btnnode: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        marginRight: 0.5,
        backgroundColor: UColor.mainColor,
    },
    nodenumber: {
        fontSize: ScreenUtil.setSpText(18), 
        color: UColor.fontColor,
    },
    nodetext: {
        fontSize: ScreenUtil.setSpText(14), 
        color: UColor.lightgray,
    },
    btnvote: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginLeft: 0.5,
        backgroundColor: UColor.mainColor,
    },
    voteimg: {
        width: ScreenUtil.autowidth(30), 
        height: ScreenUtil.autowidth(30),
    },
    votetext: {
        marginLeft: ScreenUtil.autowidth(20),
        fontSize: ScreenUtil.setSpText(18),
        color: UColor.fontColor
    },

});

export default Imvote;
