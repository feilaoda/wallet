import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, View, Text, ScrollView, Image, ImageBackground } from 'react-native';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import ScreenUtil from '../../utils/ScreenUtil'
import BaseComponent from "../../components/BaseComponent";

@connect(({wallet}) => ({...wallet}))
class AgentInfo extends BaseComponent {

    static navigationOptions =  {
        title: "代理人信息",
        headerStyle: {
            paddingTop: ScreenUtil.autoheight(20),
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            isAllSelected: true,  
            isNotDealSelected: false,        
        };
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
 
    prot = () => {
        const { navigate } = this.props.navigation;
        navigate('Web', { title: this.props.navigation.state.params.coins.name, url: this.props.navigation.state.params.coins.url });
      }

    render() {
        const agent = this.props.navigation.state.params.coins;
        return (
            <View style={styles.container}> 
                <ScrollView>
                    <View style={styles.outsource}>
                        <ImageBackground style={styles.AgentInfo} source={UImage.AgentInfo_bg} resizeMode="stretch">                  
                            <View style={styles.bjoutsource}>
                                <Image style={styles.imgtext} source={{uri: agent.icon}}/>
                            </View>
                            <Text style={styles.nametext}>{agent.name}</Text>           
                        </ImageBackground> 
                        <View style={styles.dasoutsource}>
                            {/* <Image style={styles.dasimg} source={UImage.AgentInfo_bg}/> */}
                            <View style={styles.minbag}>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{agent.region}</Text>
                                    <Text style={styles.state}>地区</Text>
                                </View>
                                <View style={styles.frame}>
                                    <Text style={styles.numbers}>{parseInt(agent.total_votes)}</Text>
                                    <Text style={styles.state}>得票总数</Text>
                                </View>
                            </View>   
                            <View style={styles.minbag}>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{agent.ranking}</Text>
                                    <Text style={styles.state}>排名</Text>
                                </View>
                                <View style={styles.frame}>
                                    <Text style={styles.number}> </Text>
                                    <Text style={styles.state}>出块状态</Text>
                                </View>
                            </View> 
                            <View style={styles.Official}>
                                <Text style={styles.Officialtitle}>官网：</Text>
                                <Text onPress={() => this.prot()} style={styles.Officialtext}>{agent.url}</Text>
                            </View>
                        </View>
                    </View> 
                    <View style={styles.synopsis}>  
                        <View style={styles.spsoutsource}>
                            <Text style={styles.spstext}>{agent.introduce}</Text>
                        </View>
                    </View>
                </ScrollView>        
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.fontColor,
    },

    outsource: { 
        paddingHorizontal: ScreenUtil.autowidth(5),
        paddingBottom: ScreenUtil.autoheight(10), 
        backgroundColor: UColor.secdColor,
    },

    AgentInfo: {
        justifyContent: "center", 
        alignItems: 'center', 
        height: ScreenUtil.autoheight(118), 
        flexDirection:'column', 
        marginVertical: ScreenUtil.autoheight(5),
    },

    bjoutsource: {
        width: ScreenUtil.autowidth(50), 
        height: ScreenUtil.autowidth(50), 
        backgroundColor: UColor.mainColor,
        justifyContent: "center", 
        alignItems: 'center', 
        borderRadius: 25, 
        margin: ScreenUtil.autowidth(5),
    },

    imgtext: {
        width: ScreenUtil.autowidth(40), 
        height: ScreenUtil.autowidth(40),
    },

    nametext: {
        width: ScreenUtil.autowidth(117), 
        height: ScreenUtil.autoheight(24), 
        lineHeight: ScreenUtil.autoheight(24), 
        backgroundColor: UColor.tintColor, 
        textAlign: 'center', 
        color:  UColor.fontColor,
        borderRadius: 5,
    },

    dasoutsource: {
        padding: ScreenUtil.autowidth(5), 
        backgroundColor: UColor.mainColor, 
        borderRadius: 5,
    },

    dasimg: {
        width: ScreenUtil.autowidth(35), 
        height: ScreenUtil.autoheight(26), 
        position: 'absolute', 
        top: 0, 
        left: ScreenUtil.autowidth(15), 
        zIndex: 999
    },

    minbag: {
        flexDirection: "row",
    },

    frame: {
        flex: 1,
        height: ScreenUtil.autoheight(60),
        margin: ScreenUtil.autowidth(2), 
        paddingVertical: ScreenUtil.autowidth(10),
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: UColor.secdColor,
    },
    numbers: {
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.fontColor,   
    },

    number: {
        fontSize: ScreenUtil.setSpText(18), 
        color: UColor.fontColor,   
    },

    state: {  
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.lightgray, 
    },

    tablayout: {   
        flexDirection: 'row',  
    },  

    buttontab: {  
        margin: ScreenUtil.autowidth(5),
        width: ScreenUtil.autowidth(100),
        height: ScreenUtil.autoheight(33),
        borderRadius: 15,
        alignItems: 'center',   
        justifyContent: 'center', 
    },

    Official: {
        height: ScreenUtil.autoheight(35), 
        flexDirection: "row", 
        justifyContent: 'flex-start', 
        alignItems: 'center'
    },

    Officialtitle: {
        fontSize: ScreenUtil.setSpText(12), 
        color: UColor.arrow, 
        marginTop: ScreenUtil.autoheight(5),
    },

    Officialtext: {
        fontSize: ScreenUtil.setSpText(13), 
        color: UColor.tintColor, 
        marginTop: ScreenUtil.autoheight(5),
    },

    synopsis: {
        flex: 1,  
        backgroundColor: UColor.fontColor, 
        paddingTop: ScreenUtil.autoheight(5), 
        paddingHorizontal: ScreenUtil.autowidth(35),
    },

    spsoutsource: {
        paddingVertical: ScreenUtil.autoheight(25),
    },

    spstext: {  
       fontSize: ScreenUtil.setSpText(14),
       color: UColor.blackColor,
       lineHeight: ScreenUtil.autoheight(25),
    },  

    
});

export default AgentInfo;
