/**
 * Created by zhuang.haipeng on 2017/9/12.
 */
import React from 'react';
import { connect } from 'react-redux'
import {NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,TouchableOpacity,} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyShowLD } from '../../components/EasyShow'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import Assets from '../../models/Assets';
var dismissKeyboard = require('dismissKeyboard');
@connect(({addressBook}) => ({...addressBook}))
class addressManage extends BaseComponent {
    static navigationOptions = {
        title: 'EOS地址薄',  
        headerStyle:{
            paddingTop: ScreenUtil.autoheight(20),
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
        }    
      };
 // 构造函数  
  constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            show:false,
            dataSource: ds.cloneWithRows([]),
            isEdit: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            labelName:'',
            address:'',
            isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
            coinType: (this.props.navigation.state.params.coinType == null || this.props.navigation.state.params.coinType == "") ? "eos" : this.props.navigation.state.params.coinType,
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
    }

    newlyAddedClick() {  
        //   console.log('右侧按钮点击了');  
        this._setModalVisible();  
      }  
    
       // 显示/隐藏 modal  
    _setModalVisible() { 
        this.state.labelName = ''; 
        this.state.address = '';
        let isShow = this.state.show;  
        this.setState({  
          show:!isShow,  
        });  
      }  

      verifyAccount(obj){
        var ret = true;
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        if(obj == "" || obj.length > 12){
            return false;
        }
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }

            if(j >= charmap.length){
                //非法字符
                // obj = obj.replace(tmp, ""); 
                ret = false;
                break;
            }
        }
        return ret;
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
        if (obj == this.props.defaultWallet.account) {
            EasyToast.show('收款账户和转出账户不能相同，请重输');
            obj = "";
        }
        return obj;
    }

    componentDidMount() {
        // this.setState({
        //     dataSource: this.state.dataSource.cloneWithRows(collectionArray)
        // })
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/addressInfo'});

        DeviceEventEmitter.addListener('scan_result', (data) => {
            if(data && data.toaccount){
                if(this.verifyAccount(data.toaccount)){
                    this.setState({address:data.toaccount,show:true});
                }else{
                    EasyToast.show('请输入正确的账号');
                }
            }
        });

    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
      }
    confirm() {
        if (this.state.labelName == "") {
            EasyToast.show('请输入标签名称');
            return;
          }
        if (this.state.address == "") {
            EasyToast.show('请输入收款人地址');
            return;
        }

        try {
            EasyShowLD.loadingShow();
            this.props.dispatch({ type: 'addressBook/saveAddress', payload: { address: this.state.address, labelName: this.state.labelName }, callback: (data) => {
                EasyShowLD.loadingClose();
                this._setModalVisible();
            } });
          } catch (error) {
            EasyShowLD.loadingClose();
          }
    }


    selectAddress(selectAccount){
        var jsoncode = '{"toaccount":"' + selectAccount + '","symbol":"' + this.state.coinType + '"}';
        var coins = JSON.parse(jsoncode);
        this.props.navigation.goBack();  //正常返回上一个页面

        if(this.state.isTurnOut){
            DeviceEventEmitter.emit('scan_result',coins);
        }else{
            const { navigate } = this.props.navigation;
            navigate('TurnOut', { coins: coins });
        }
        console.log("selectAddress:%s",selectAccount);
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    renderRow = (rowData, sectionID, rowID) => { // cell样式

        let map = this.state.selectMap;
        let isChecked = map.has(parseInt(rowID))
        // 选中的时候, 判断上一个索引不等于rowID的时候,不让他选中   **** 单选逻辑 ****
        // let isChecked = parseInt(rowID) == this.state.preIndex ?  map.has(parseInt(rowID)) : false; // 将rowID转成Int,然后将Int类型的ID当做Key传给Map

        return (
            <View style={styles.selectout}>
               {this.state.isEdit ? 
               <TouchableOpacity style={styles.touchSelect} onPress={() => this.selectItem(parseInt(rowID), rowData.labelName, isChecked)}>
                    <Image source={isChecked ? UImage.aab1:UImage.aab2} style={styles.selectoutimg}/>
                </TouchableOpacity> : null}
                <Button  onPress={this.state.isEdit ?null:this.selectAddress.bind(this,rowData.address)}>
                    <View style={styles.selout}>
                        <Text style={styles.outlabelname}>{"标签:"+rowData.labelName}</Text>
                        <Text style={styles.outaddress}>{"账号:"+rowData.address}</Text>
                    </View>
                </Button>    
           </View>
        )
    }

    scan() {
        if (this.state.labelName == "") {
            EasyToast.show('请输入标签名称');
            return;
        }
        this.setState({show:false});  
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.coinType});
    }
    render() {
        let temp = [...this.state.selectMap.values()];
        let isChecked = temp.length === this.state.dataSource._cachedRowCount;

        console.log(temp, '......')
        return (
            <View style={styles.container}>
                
                <ListView renderRow={this.renderRow}  
                enableEmptySections = {true}  
                dataSource={this.state.dataSource.cloneWithRows((this.props.addressBook == null ? [] : this.props.addressBook))}> 
                </ListView> 

                { this.state.isShowBottom == false ? 
                <View style={styles.replace}>
                    <TouchableOpacity onPress={this.newlyAddedClick.bind(this)} style={styles.added}>
                        <Text style={styles.address}>新增地址</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.editClick(this)} style={styles.editClickout}>
                        <Text style={styles.address}>管理地址</Text>
                    </TouchableOpacity>                 
                </View> : null
                }             
                { this.state.isShowBottom == true ? 
                <View style={styles.alternate}>                         
                    <TouchableOpacity onPress={() => this.deleteItem(this)} style={styles.deleteItemout}>
                        <Text style={styles.address}>删除地址</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.editClick(this)} style={styles.completeout}>                              
                        <Text style={styles.address}>完成</Text>
                    </TouchableOpacity>
                </View> : null
                }
                <View style={styles.pupuo}>  
                    <Modal  animationType='slide'  transparent={true}  visible={this.state.show}  onShow={() => {}}  onRequestClose={() => {}} >  
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)} style={styles.modalStyle}>   
                                <View style={styles.subView} >  
                                    <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>  
                                        <Text style={styles.buttoncols}>×</Text>                                          
                                    </Button>  
                                    <Text style={styles.titleText}>添加地址</Text> 
                                    <View style={styles.inptout} >
                                        <TextInput onChangeText={(labelName) => this.setState({ labelName })} returnKeyType="next" maxLength = {20}
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}  
                                        placeholder="输入标签名称" underlineColorAndroid="transparent" value={this.state.labelName} />
                                    </View>    
                                    <View style={styles.inptoutsource}>
                                        <View style={styles.accountoue} >
                                            <TextInput onChangeText={(address) => this.setState({ address: this.chkAccount(address) })} returnKeyType="next" maxLength = {12}
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                            placeholder="输入账户名称" underlineColorAndroid="transparent"  value={this.state.address}/>
                                        </View>    
                                        <View style={styles.scanning}>
                                            <Button onPress={() => this.scan()}>                                  
                                                <Image source={UImage.account_scan} style={styles.scanningimg} />                                 
                                            </Button>
                                        </View>                           
                                    </View>  

                                    <Button onPress={() => this.confirm(this) }>
                                        <View style={styles.conout}>
                                            <Text style={styles.context}>确认</Text>
                                        </View>
                                    </Button>
                                </View>  
                            </TouchableOpacity>
                        </Modal>  
                </View>    
            </View>
        );
    }

    

    editClick = () => { // 管理地址
        this.setState({
            isEdit: !this.state.isEdit,
            selectMap: new Map()
        }, () => {
            this.setState({
                isShowBottom: this.state.isEdit ? true : false
            })
        })    
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/addressInfo'});   
    };

    deleteItem = () => { // 删除地址
        let {selectMap} = this.state;
        // let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'addressBook/delAddress', payload: { keyArr: keyArr}});
       
    };

    // allSelect = (isChecked) => { // 全选
    //     this.setState({
    //         isAllSelect: !isChecked
    //     });
    //     if (isChecked) { // 如果已经勾选了,则取消选中
    //         let {selectMap} = this.state;
    //         selectMap = new Map();
    //         this.setState({selectMap})
    //     } else { // 没有勾选的, 全部勾选
    //         let newMap = new Map();
    //         for (let key = 0; key < collectionArray.length; key++) {
    //             let value = collectionArray[key].collectItem; // 拿到数组的collectItem
    //             newMap.set(key, value) // 第一个key, 第二个是value
    //         }
    //         this.setState({selectMap: newMap})
    //     }
    // }

    selectItem = (key, value, isChecked) => { // 单选
        this.setState({
            isChecked: !this.state.isChecked,
            // preIndex: key  //  **** 单选逻辑 ****
        }, () => {
            let map = this.state.selectMap;
            if (isChecked) {
                map.delete(key, value) // 再次点击的时候,将map对应的key,value删除
            } else {
                // map = new Map() // ------>   **** 单选逻辑 ****
                map.set(key, value) // 勾选的时候,重置一下map的key和value
            }
            this.setState({selectMap: map})
        })
    }
};

const styles = StyleSheet.create({
    selectout: {
        flex: 1,
        flexDirection: "row",
        // alignItems: 'flex-start', 
    },
    selectouttou: {
        position:'absolute',
        left:3,
    },
    selectoutimg: {
        width:30,
        height:30,
    },
    touchSelect:{ 
        width: 60, 
        height: 60, 
        backgroundColor: UColor.secdColor, 
        marginTop: 5, 
        marginBottom: 5, 
        alignItems: "center", 
        justifyContent: 'center', 
       //  paddingLeft: this.state.isEdit ? 54 : 0
   },

    selout: {
        flex: 1, 
        width: ScreenWidth-20,
        height: 60,
        backgroundColor: UColor.mainColor,
        marginBottom: 10,
        marginLeft:10,
        marginRight:10,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: "flex-start",
        justifyContent: 'center',
        borderColor: UColor.mainColor,
        borderWidth: 1,
        borderRadius: 5,
    },
    outlabelname:{
        color: UColor.fontColor,
        fontSize:15,
    },
    outaddress: {
        color: UColor.arrow,
        fontSize:15,
    },


    container: {
        flex: 1,
        backgroundColor: UColor.secdColor,
        paddingTop: 5,
    },
    replace: {
        width: ScreenWidth,
        backgroundColor: UColor.secdColor,
        justifyContent: "space-between",
        flexDirection: 'column',
        alignItems: "center"
    },
    alternate: {
        width: ScreenWidth,
        backgroundColor: UColor.secdColor,
        justifyContent: "space-between",
        flexDirection: 'column',
        alignItems: "center"
    },
    added: {
        width: ScreenWidth - 20,
        height: 45,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderRadius: 5
    },
    address: {
        fontSize:17,
        color:UColor.fontColor
    },
    editClickout: {
        width: ScreenWidth - 20,
        height: 45,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderRadius: 5
    },

    deleteItemout: {
        width: ScreenWidth - 20,
        height: 45,
        backgroundColor: UColor.riseColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderRadius: 5
    },
    completeout: {
        flexDirection:'row',
        width: ScreenWidth - 20,
        height: 45,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderRadius: 5
    },
   

    pupuo:{  
        backgroundColor: UColor.riceWhite,  
      },  
      // modal的样式  
      modalStyle: {  
        backgroundColor: UColor.mask,  
        alignItems: 'center',  
        justifyContent:'center',  
        flex:1,  
      }, 
       // 按钮  
       buttonView:{  
        alignItems: 'flex-end', 
      },  
      buttoncols: {
        width: 30,
        height: 30,
        marginBottom: 0,
        color: UColor.baseline,
        fontSize: 28,
      },
      
      // modal上子View的样式  
      subView:{  
        width:ScreenWidth-20,
        marginHorizontal:10,  
        backgroundColor: UColor.fontColor,  
        alignSelf: 'stretch',  
        justifyContent:'center',  
        borderRadius: 10,  
        borderWidth: 0.5,  
        borderColor: UColor.baseline,  
      },  
      // 标题  
      titleText:{   
        marginBottom:10,  
        fontSize:18,  
        fontWeight:'bold',  
        textAlign:'center',  
      }, 
      inptout: {
          width:ScreenWidth-40,
          height: 40,
          paddingHorizontal: 10,
          backgroundColor: UColor.riceWhite,
          marginBottom: 10,
          marginHorizontal: 10,
          justifyContent: 'center',
      },
      inpt: {
          color: UColor.arrow,
          fontSize: 14,
          height: 50,
          paddingLeft: 2
      },
      conout: {
          margin: 10,
          height: 40,
          borderRadius: 6,
          backgroundColor: UColor.tintColor,
          justifyContent: 'center',
          alignItems: 'center'
      },
      context: {
        fontSize: 16, 
        color: UColor.fontColor
      },

      inptoutsource: {
        width:ScreenWidth-40,
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: UColor.riceWhite,
        marginBottom: 10,
        marginHorizontal: 10,
        // justifyContent: 'center',

        flexDirection: 'row',
        // marginBottom: 10,
        // paddingLeft: 5,
    },
    accountoue: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: "column",
    },

    scanning: {
        width: 40,
        flexDirection: "row",
        alignSelf: 'center',
        justifyContent: "center",
    },
    scanningimg: {
        width:30,
        height:30,
    },

  
})

export default addressManage;