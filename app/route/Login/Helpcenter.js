import React from 'react';
import { StyleSheet, View, Text, Image, TouchableHighlight } from 'react-native';
import UImage from "../../utils/Img";
import UColor from '../../utils/Colors'
import Item from '../../components/Item'
import ScreenUtil from '../../utils/ScreenUtil'
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";

class Helpcenter extends BaseComponent {

  static navigationOptions = {
    title: '帮助中心',
    headerStyle: {
      paddingTop: ScreenUtil.autoheight(20),
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
    this.config = [
      { first: true, name: "什么是钱包？", onPress: this.goPage.bind(this, "wallet") },
      { name: "什么是私钥？", onPress: this.goPage.bind(this, "ks") },
      { name: "如何导入EOS钱包？", onPress: this.goPage.bind(this, "iw") },
      { name: "如何添加钱包？", onPress: this.goPage.bind(this, "atw") },
      { name: "如何转账？", onPress: this.goPage.bind(this, "ta") },
    ];
  }

  //组件加载完成
  componentDidMount() {
    // super.componentDidMount();
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "commonproblem"){
      navigate('Web', { title: "EOS常见问题", url: "http://static.eostoken.im/html/20180802/1533189528050.html" });
    } else if (key == "wallet") {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Wallet.html" });
    } else if (key == 'ks') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Keystore.html" });
    } else if (key == 'mw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/MemorizingWords.html" });
    } else if (key == 'iw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/ImportWallet.html" });
    }else if (key == 'atw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/AddToWallet.html" });
    }else if (key == 'bw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/BackupsWallet.html" });
    }else if (key == 'ta') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/TransferAccounts.html" });
    }else if (key == 'vote') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/VoteCourse.html" });
    }else if (key == 'pf'){
      navigate('ProblemFeedback', {});
    }else if (key == 'NoviceMustRead') {
      navigate('Web', { title: "新手必读", url: "http://static.eostoken.im/html/NoviceMustRead.html" });
    }else if (key == 'Troubleshooting') {
      navigate('Web', { title: "疑难解答", url: "http://static.eostoken.im/html/Troubleshooting.html" });
    }else{
      EasyShowLD.dialogShow("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyShowLD.dialogClose() });
    }
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  render() {
    return <View style={styles.container}>
        <View style={styles.touchableout}>
          <TouchableHighlight onPress={this.goPage.bind(this, 'commonproblem')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={styles.listItem} borderColor={UColor.arrow}>
              <Text style={styles.fontColortext}>EOS常见问题？</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.goPage.bind(this, 'NoviceMustRead')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={styles.listItem} borderColor={UColor.arrow}>
              <Text style={styles.fontColortext}>新手必读？</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.touchableout}>
          <TouchableHighlight onPress={this.goPage.bind(this, 'Troubleshooting')}  style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={styles.listItem} borderColor={UColor.arrow}>
              <Text style={styles.fontColortext} >疑难解答？</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.goPage.bind(this, 'pf')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={styles.listItem} borderColor={UColor.tintColor}>
              <Text style={styles.tintColortext}  >问题反馈</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View>
          {this._renderListItem()}
        </View>
        <View style={styles.logout}>
            <Image source={UImage.bottom_log} style={styles.logimg}/>
            <Text style={styles.logtext}>EosToken 专注柚子生态</Text>
        </View>
    </View>
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: UColor.secdColor,
    },
    touchableout: {
      flexDirection: "row",
      paddingTop: ScreenUtil.autoheight(15),
      paddingHorizontal: ScreenUtil.autowidth(5),
    },
    touchable:{
      flex: 1, 
      marginHorizontal: ScreenUtil.autowidth(3), 
    },
    fontColortext: {
      fontSize: ScreenUtil.setSpText(15),
      color:UColor.fontColor,
    },
    tintColortext: {
      fontSize: ScreenUtil.setSpText(15),
      color:UColor.tintColor
    },
    listItem: {
      height: ScreenUtil.autoheight(70),
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 5, 
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
    }
});

export default Helpcenter;