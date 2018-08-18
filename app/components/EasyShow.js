import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Modal, Text, Platform, TouchableHighlight, KeyboardAvoidingView, TouchableWithoutFeedback, View, Dimensions, ActivityIndicator} from 'react-native';
import { material } from 'react-native-typography';
import ProgressBar from "./ProgressBar";
import UColor from '../utils/Colors'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const prs = 0;
const tk = null;
const LoadingShow=true;
const DailogShow=false;

export class EasyShowLD {
    
    constructor() {}

    static bind(LoadingDialog) {
      this.map["LoadingDialog"] = LoadingDialog;
    }

    static unBind() {
      this.map["LoadingDialog"] = null;
      delete this.map["LoadingDialog"];
    }

    static dialogShow(title, content, okLable, disLabel, okHandler) {
      clearTimeout(this.handle);
      this.map["LoadingDialog"].setState({
        "modalVisible": true,
        "loadingDialogFlag": DailogShow,
        title,
        content,
        okLable,
        disLabel,
        okHandler
      });
    }

    static dialogClose() {
      clearTimeout(this.handle);
        this.map["LoadingDialog"].setState({
          "modalVisible": false,
        });
    }

    //进度条
    static startProgress() {
      this.map["LoadingDialog"].setState({
        okHandler: null,
        disLabel: null,
        showProgress: true
      });
      var th = this;
      tk = setInterval(function () {
        th.map["LoadingDialog"].setState({
          progress: prs
        })
      }, 300);
    }

    static endProgress() {
      clearInterval(tk);
    }

    static progress(total, current) {
      let p = current / total;
      prs = parseInt((ScreenWidth - 32) * p);
    }



    //以下是loading部分的
    static loadingShow(text = 'Loading...', timeout = 60000) {
      clearTimeout(this.handle);
      this.map["LoadingDialog"].setState({
        modalVisible: true,
        loadingDialogFlag: LoadingShow,
        "text": text,
        "timeout": timeout
      });

      if (timeout > 0) {
        var th = this;
        this.handle = setTimeout(() => {
          th.loadingClose();
          clearTimeout(this.handle);
        }, timeout);
      }

    }

    //切换页面时,如果有loading显示,立刻关闭
    static switchRoute() {

      if (this.map["LoadingDialog"] && this.map["LoadingDialog"].state.modalVisible) {
        this.map["LoadingDialog"] && this.map["LoadingDialog"].setState({
            "modalVisible": false
          });
      }
    }

    static loadingClose() {
      clearTimeout(this.handle);
      this.map["LoadingDialog"].setState({
        "modalVisible": false
      });
    }

}

EasyShowLD.map = {};

export class LoadingDialog extends React.Component {


    static propTypes = {
      type: PropTypes.string,
      color: PropTypes.string,
      textStyle: PropTypes.any,
      loadingStyle: PropTypes.any,
    };


    state = {
      modalVisible: false,
      loadingDialogFlag:LoadingShow,

      showProgress: false,
      progress: 0,

      timeout: 60000,
      text: "Loading..."
    };

    constructor(props) {
      super(props);
      let handle = 0;
      EasyShowLD.bind(this);
    }


    componentWillUnmount() {
      clearTimeout(this.handle);

    }


    render() {

        return (
          <View style={styles.container}>

          <Modal
            animationType={'fade'}
            transparent={true}
            hardwareAccelerated
            visible={this.state.modalVisible}
            onRequestClose={()=>{console.log('dailog modal close...')}}
            supportedOrientations={['portrait', 'landscape']}
            onShow={()=>{console.log('dailog modal show...')}}>

          {this.state.loadingDialogFlag==LoadingShow &&
          <View style={[styles.load_box, this.props.loadingStyle]}>
              <ActivityIndicator animating={true} color={this.props.color || UColor.fontColor} size={'large'} style={styles.load_progress} />
              <Text style={[styles.load_text, this.props.textStyle]}>{this.state.text}</Text>
          </View>}

          {this.state.loadingDialogFlag==DailogShow &&
            <TouchableWithoutFeedback>
              <View style={styles.backgroundOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
                  <View style={[styles.modalContainer,styles.modalContainerPadding]}>
                    <TouchableWithoutFeedback>
                      <View>
                        <View style={styles.titleContainer}>
                            <Text style={[material.title,{color:UColor.mainColor}]}>{this.state.title}</Text>
                        </View>
                        <View style={[styles.contentContainer,styles.contentContainerPadding]}>
                          {
                            (typeof(this.state.content)=='string')?<Text style={styles.contentext}>{this.state.content}</Text>:this.state.content
                          }
                        </View>
                        <View style={styles.actionsContainer}>
                          {this.state.disLabel?(
                            <TouchableHighlight
                              testID="dialog-cancel-button"
                              style={styles.disactionContainer}
                              underlayColor={UColor.arrow}
                              onPress={()=>{this.setState({modalVisible:false})}}>
                              <Text style={[material.button, { color: UColor.fontColor }]}>{this.state.disLabel}</Text>
                            </TouchableHighlight>
                          ):null
                        }
                        {this.state.okHandler?(
                            <TouchableHighlight
                              testID="dialog-ok-button"
                              style={styles.okactionContainer}
                              underlayColor={UColor.arrow}
                              onPress={this.state.okHandler}>
                              <Text style={[material.button, { color: UColor.fontColor }]}>{this.state.okLable}</Text>
                            </TouchableHighlight>
                          ):null
                        }
                        {this.state.showProgress?<ProgressBar
                            style={{marginTop:47,width:ScreenWidth-32}}
                            progress={this.state.progress}
                          />:null}
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </TouchableWithoutFeedback>}
          </Modal>
        </View>
        )
    }
}

const styles = StyleSheet.create({
  backgroundOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UColor.mask,
  },
  modalContainer: {
    marginHorizontal: 10,
    padding: 10,
    marginVertical: 106,
    minWidth: ScreenWidth - 30,
    borderRadius: 2,
    elevation: 24,
    overflow: 'hidden',
    backgroundColor:UColor.fontColor,
    borderRadius: 5,
  },
  modalContainerPadding: {
    paddingTop: 24,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: -1,
  },
  contentContainerPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentext : {
    fontSize: 16,
    lineHeight: 25,
  },
  contentContainerScrolled: {
    flex: -1,
    maxHeight: ScreenHeight - 264, // (106px vertical margin * 2) + 52px
  },
  contentContainerScrolledPadding: {
    paddingHorizontal: 24,
  },
  actionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  disactionContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    minWidth: (ScreenWidth - 80)/2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UColor.showy,
    borderRadius: 3,
  },
  okactionContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    minWidth: (ScreenWidth - 80)/2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UColor.tintColor,
    borderRadius: 3,
  },


load_box: {
    width: 100,
    height: 100,
    backgroundColor: UColor.blackColor,
    alignItems: 'center',
    marginLeft: ScreenWidth / 2 - 50,
    marginTop: ScreenHeight / 2 - 50,
    borderRadius: 10
},
load_progress: {
    position: 'absolute',
    width: 100,
    height: 90
},
load_text: {
    marginTop: 70,
    color: UColor.fontColor,
},


  container: {
    // flex: 1,
    // backgroundColor: UColor.secdColor,
  },





});
