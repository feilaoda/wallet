import React from 'react';
import { StyleSheet, View, Text, Image, TouchableHighlight } from 'react-native';
import UImage from "../../utils/Img";
import UColor from '../../utils/Colors'
import Item from '../../components/Item'
import ScreenUtil from '../../utils/ScreenUtil'
import Header from '../../components/Header'
import { EasyShowLD } from "../../components/EasyShow"
import BaseComponent from "../../components/BaseComponent";

class Helpcenter extends BaseComponent {

  static navigationOptions = {
    title: '帮助中心',
    header:null, 
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
    return <View style={[styles.container,{backgroundColor: UColor.secdColor}]}>
        <Header {...this.props} onPressLeft={true} title="帮助中心" />
        <View style={[styles.touchableout,{paddingTop: ScreenUtil.autoheight(10),marginBottom: ScreenUtil.autoheight(1)}]}>
          <TouchableHighlight onPress={this.goPage.bind(this, 'commonproblem')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor,marginRight: 0.5,}]} borderColor={UColor.arrow}>
              <Image source={UImage.commonwt} style={styles.problem}/>
              <Text style={[styles.fontColortext,{color:UColor.fontColor}]}>EOS常见问题？</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.goPage.bind(this, 'NoviceMustRead')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor,marginLeft: 0.5,}]} borderColor={UColor.arrow}>
              <Image source={UImage.mustread} style={styles.problem}/>
              <Text style={[styles.fontColortext,{color:UColor.fontColor}]}>新手必读？</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.touchableout}>
          <TouchableHighlight onPress={this.goPage.bind(this, 'Troubleshooting')}  style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor,marginRight: 0.5,}]} borderColor={UColor.arrow}>
              <Image source={UImage.difficult} style={styles.problem}/>
              <Text style={[styles.fontColortext,{color:UColor.fontColor}]}>疑难解答？</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.goPage.bind(this, 'pf')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
            <View style={[styles.listItem,{backgroundColor: UColor.mainColor,marginLeft: 0.5,}]} borderColor={UColor.tintColor}>
              <Image source={UImage.feedback} style={styles.problem}/>
              <Text style={[styles.tintColortext,{color:UColor.fontColor}]}>问题反馈</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View>
          {this._renderListItem()}
        </View>
        <View style={styles.logout}>
            <Image source={UImage.bottom_log} style={styles.logimg}/>
            <Text style={[styles.logtext,{color: UColor.arrow}]}>EosToken 专注柚子生态</Text>
        </View>
    </View>
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    touchableout: {
      flexDirection: "row",
    },
    touchable:{
      flex: 1,  
    },
    problem: {
      width: ScreenUtil.autowidth(30), 
      height: ScreenUtil.autowidth(30)
    },
    fontColortext: {
      paddingTop: ScreenUtil.autoheight(5),
      fontSize: ScreenUtil.setSpText(12),
    },
    tintColortext: {
      paddingTop: ScreenUtil.autoheight(5),
      fontSize: ScreenUtil.setSpText(12),
    },
    listItem: {
      height: ScreenUtil.autoheight(70),
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
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
      lineHeight: ScreenUtil.autoheight(30),
    }
});

export default Helpcenter;