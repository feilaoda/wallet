
import React from 'react';
import { Dimensions, Animated,View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import NavigationUtil from '../utils/NavigationUtil';
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import Constants from '../utils/Constants';
import { connect } from 'react-redux'
import JPush from '../utils/JPush'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

@connect(({common}) => ({...common}))
class Splash extends React.Component {
  
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //推送初始化
    const { navigate } = this.props.navigation;
    JPush.init(navigate);

    var th = this;
    this.props.dispatch({type: 'common/loadBoot',payload:{},callback:function(data){
      if(data==1){
        NavigationUtil.reset(th.props.navigation, 'Home');
      }else{
        NavigationUtil.reset(th.props.navigation, 'Boot');
      }
    }});
  }

  render() {
    return (
      <View style={{backgroundColor: UColor.secdColor}}/>
    );
  }
}

export default Splash;