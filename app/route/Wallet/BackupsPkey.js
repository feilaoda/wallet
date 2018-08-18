import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, StyleSheet, View, Text, Image, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyToast } from '../../components/Toast';
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants';
import {NavigationActions} from 'react-navigation';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

@connect(({ wallet }) => ({ ...wallet }))
class BackupsPkey extends BaseComponent {

    static navigationOptions =  {
        headerTitle: '备份私钥',
        headerStyle: {
            paddingTop: ScreenUtil.autoheight(20),
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            ownerPk: '',
            activePk: '',
            show: false,
        }
    }

     //组件加载完成
     componentDidMount() {
         var ownerPrivateKey = this.props.navigation.state.params.wallet.ownerPrivate;
         var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
         var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
         var activePrivateKey = this.props.navigation.state.params.wallet.activePrivate;
         var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
         var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
        if (plaintext_words_owner.indexOf('eostoken') != - 1) {
            this.setState({
                ownerPk: plaintext_words_owner.substr(8, plaintext_words_owner.length),
                activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
            })
        }
    }

    componentWillUnmount(){
        var entry = this.props.navigation.state.params.entry;
        if(entry == "createWallet"){
            this.pop(1, true);
        }
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    
    }

    toBackup = (data) => {
        this.props.navigation.goBack();
        const { navigate } = this.props.navigation;
        navigate('BackupWords', data);
    }

    decryptWords = () => {
        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}   
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent"/>
            </View>

        EasyShowLD.dialogShow("密码", view, "备份", "取消", () => {

            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            try{
            var _words = this.props.navigation.state.params.words;
            var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

            var words_active = this.props.navigation.state.params.words_active;
            var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

            if (plaintext_words.indexOf('eostoken') != -1) {
                plaintext_words = plaintext_words.substr(9, plaintext_words.length);
                var wordsArr = plaintext_words.split(',');

                plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
                var wordsArr_active = plaintext_words_active.split(',');

                this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
            } else {
                // alert('密码错误');
                EasyToast.show('密码错误');
            }
        }catch(e){
            EasyToast.show('密码错误');
        }
            EasyShowLD.dialogClose();
        }, () => { EasyShowLD.dialogClose() });
    }

    dismissKeyboardClick() {
      dismissKeyboard();
    }

    checkClick() {
    this.setState({
        show: false
    });
    }

    prot(key, data = {}) {
        const { navigate } = this.props.navigation; 
        if(key == 'activePk'){
            Clipboard.setString(this.state.activePk);
            EasyToast.show('Active私钥已复制成功');
        } else if(key == 'ownerPk'){
          Clipboard.setString(this.state.ownerPk);
          EasyToast.show('Owner私钥已复制成功');
        }else  if(key == 'problem') {
          navigate('Web', { title: "什么是私钥", url: "http://static.eostoken.im/html/Keystore.html" });   
        }
    }

    nextStep() {
        const { navigate } = this.props.navigation;
        var entry = this.props.navigation.state.params.entry;
        var wallet = this.props.navigation.state.params.wallet;
        var password = this.props.navigation.state.params.password;
        navigate('BackupsAOkey', {wallet:wallet, password:password, entry: entry});
    }

    render() {
        return (<View style={styles.container}>
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.scrollView}>
            <View style={styles.header}>
                <View style={styles.inptoutbg}>
                    <View style={styles.headout}>
                        <Text style={styles.inptitle}>请立即备份您的私钥</Text>
                        <View style={styles.warningout}>
                            <Image source={UImage.warning} style={styles.imgBtn} />
                            <Text style={styles.headtitle}>安全警告：私钥相当于您的银行卡密码，请妥善保管！（切勿截图、存储到网络硬盘、微信等传输！）</Text>
                        </View>
                    </View> 
                    {this.state.activePk != ''&& 
                    <View style={styles.inptoutgo} >
                        <Text style={styles.inptitle}>Active私钥</Text>
                        <TouchableHighlight style={styles.inptgo}  underlayColor={UColor.secdColor}>
                            <Text style={styles.inptext}>{this.state.activePk}</Text>
                        </TouchableHighlight>
                    </View>}  
                    {this.state.ownerPk != ''&&
                    <View style={styles.inptoutgo} >
                        <Text style={styles.inptitle}>Owner私钥</Text>
                        <TouchableHighlight style={styles.inptgo}  underlayColor={UColor.secdColor}>
                            <Text style={styles.inptext}>{this.state.ownerPk}</Text>
                        </TouchableHighlight>
                    </View>}
                </View>
                <Button onPress={this.prot.bind(this, 'problem')}>
                    <Text style={styles.readtext} >什么是私钥？</Text> 
                </Button> 
                <Button onPress={() => this.nextStep()}>
                    <View style={styles.importPriout}>
                        <Text style={styles.importPritext}>下一步(已经抄好)</Text>
                    </View>
                </Button>
                <View style={styles.logout}>
                    <Image source={UImage.bottom_log} style={styles.logimg}/>
                    <Text style={styles.logtext}>EosToken 专注柚子生态</Text>
                </View>
            </View>
        </TouchableOpacity>
         
    </View>)
    }
}

const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: ScreenUtil.autoheight(45),
        width: ScreenWidth-100,
        paddingBottom: ScreenUtil.autoheight(5),
        fontSize: ScreenUtil.setSpText(16),
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flex: 1,
        marginTop: ScreenUtil.autoheight(10),
        backgroundColor: UColor.secdColor,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: ScreenUtil.autowidth(20),
        marginBottom: ScreenUtil.autoheight(10),
    },
    headout: {
        paddingTop: ScreenUtil.autoheight(20),
        paddingBottom: ScreenUtil.autoheight(15),
    },
    inptitle: {
        fontSize: ScreenUtil.setSpText(15),
        lineHeight: ScreenUtil.autoheight(30),
        color: UColor.fontColor,
    },
    warningout: {
        width: ScreenWidth-40,
        flexDirection: "row",
        alignItems: 'center', 
        paddingHorizontal: ScreenUtil.autowidth(10),
        paddingVertical: ScreenUtil.autoheight(5),
        borderColor: UColor.showy,
        borderWidth: 1,
        borderRadius: 5,
    },
    imgBtn: {
        width: ScreenUtil.autowidth(20),
        height: ScreenUtil.autowidth(20),
    },
    headtitle: {
        flex: 1,
        color: UColor.showy,
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
        paddingLeft: ScreenUtil.autowidth(10),
    },
    inptoutgo: {
        paddingBottom: ScreenUtil.autoheight(15),
        backgroundColor: UColor.mainColor,
    },
    inptgo: {
        backgroundColor: UColor.secdColor,
        height: ScreenUtil.autoheight(60),
        width: ScreenWidth - ScreenUtil.autowidth(40),
        paddingHorizontal: ScreenUtil.autowidth(10),
    },
    inptext: {
        flexWrap: 'wrap',
        color: UColor.arrow,
        height: ScreenUtil.autoheight(60),
        fontSize: ScreenUtil.setSpText(14),
        lineHeight: ScreenUtil.autoheight(25),
        width: ScreenWidth - ScreenUtil.autowidth(60),
    },
    readtext: {
        textAlign: 'right',
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.tintColor,
    },
    importPriout: {
        height: ScreenUtil.autoheight(45),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: ScreenUtil.autowidth(20),
        marginTop: ScreenUtil.autoheight(60),
        borderRadius: 5,
        backgroundColor:  UColor.tintColor,
    },
    importPritext: {
        fontSize: ScreenUtil.setSpText(15),
        color: UColor.fontColor,
    },
    logout:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: ScreenUtil.autoheight(20),
    },
    logimg: {
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autowidth(50)
    },
    logtext: {
        fontSize: ScreenUtil.setSpText(14),
        color: UColor.arrow,
        lineHeight: ScreenUtil.autoheight(30),
    },
    
});

export default BackupsPkey;
