import React, {Component} from 'react';
import {
  Animated,
  Easing,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

const deviceWidth = Dimensions.get('window').width;
const DISMISS_MODAL_THRESHOLD = 150;

const images = [
  'https://picsum.photos/200',
  'https://picsum.photos/id/237/200/300',
  'https://picsum.photos/seed/picsum/200/300',
  'https://picsum.photos/200/300?grayscale',
  'https://picsum.photos/200/300/?blur',
];

class ZoomView extends Component {
  static defaultProps = {
    doAnimateZoomReset: false,
    maximumZoomScale: 2,
    minimumZoomScale: 1,
    zoomed: false,
    zoomEnabled: false,
    zoomHeight: 219,
    zoomWidth: deviceWidth,
  };

  state = {
    startY: null,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.zoomed === true && this.props.zoomed === false) {
      this.handleResetZoomScale();
    }
  }

  setZoomRef = node => {
    if (node) {
      this.zoomRef = node;
      this.scrollResponderRef = this.zoomRef.getScrollResponder();

      this.scrollResponderRef.scrollResponderHandleTouchStart = event => {
        const isZoom = event.nativeEvent.touches.length > 1 ? true : false;

        if (!this.props.zoomed) {
          this.setState({startY: event.nativeEvent.locationY});
        }

        if (isZoom) {
          if (!this.props.zoomed) {
            this.props.onZoomed();
          }
        }
      };

      this.scrollResponderRef.scrollResponderHandleTouchEnd = event => {
        console.log('end');
        if (this.props.zoomed) {
          this.imageRef.measure((ox, oy, width) => {
            if (width <= this.props.zoomWidth) {
              this.props.onZoomExit();
              return;
            } else {
              return;
            }
          });
        } else {
          const isZoom = event.nativeEvent.touches.length > 1 ? true : false;

          if (!isZoom) {
            const currentY = event.nativeEvent.locationY;
            const scrollYDistance = Math.abs(this.state.startY - currentY);
            if (scrollYDistance > DISMISS_MODAL_THRESHOLD) {
              this.props.onZoomClosePress();
            }
          }
        }
      };
    }
  };

  setImageRef = node => {
    if (node) {
      this.imageRef = node;
    }
  };

  handleZoomViewPress = () => {
    this.props.setModal();
    if (!this.props.zoomEnabled) {
      this.props.onZoomEnabled();
    } else {
      if (this.props.zoomed) {
        this.handleResetZoomScale();
        this.props.onZoomClosePress();
      }
    }
  };

  handleResetZoomScale = () => {
    this.scrollResponderRef.scrollResponderZoomTo({
      x: 0,
      y: 0,
      width: this.props.zoomWidth,
      height: this.props.zoomHeight,
      animated: true,
    });
  };

  render() {
    return (
      <ScrollView
        contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}
        centerContent
        maximumZoomScale={
          this.props.zoomEnabled ? this.props.maximumZoomScale : 1
        }
        minimumZoomScale={this.props.minimumZoomScale}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={this.setZoomRef}
        scrollEnabled={this.props.zoomEnabled}
        scrollEventThrottle={10}
        style={{
          overflow: 'visible',
        }}>
        <TouchableOpacity
          onPress={this.handleZoomViewPress}
          flexGrow={1}
          flex={1}>
          <Image
            source={{uri: this.props.source}}
            resizeMode="contain"
            style={{
              height: 219,
              width: deviceWidth,
            }}
            ref={this.setImageRef}
          />
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

export default class App extends Component {
  animZoomVal = new Animated.Value(0);

  animInverseZoomVal = this.animZoomVal.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  animValUpTiming = Animated.timing(this.animZoomVal, {
    toValue: 1,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
  });
  animValDownTiming = Animated.timing(this.animZoomVal, {
    toValue: 0,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
  });
  animTranslateY = this.animZoomVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  animScrollBarOpacityVal = new Animated.Value(1);
  animScrollOpacityUpTiming = Animated.timing(this.animScrollBarOpacityVal, {
    toValue: 1,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
  });
  animScrollOpacityDownTiming = Animated.timing(this.animScrollBarOpacityVal, {
    toValue: 0,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
  });

  animCloseOpacityVal = new Animated.Value(0);
  animCloseOpacityUpTiming = Animated.timing(this.animCloseOpacityVal, {
    toValue: 1,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
  });
  animCloseOpacityDownTiming = Animated.timing(this.animCloseOpacityVal, {
    toValue: 0,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
  });

  animScrollXVal = new Animated.Value(0);

  scrollXVal = this.animScrollXVal.interpolate({
    inputRange: [0, deviceWidth * (images.length - 1)],
    outputRange: [0, (deviceWidth / images.length) * (images.length - 1)],
    extrapolate: 'clamp',
  });

  state = {
    zoomEnabled: false,
    zoomed: false,
    modal: false,
  };

  handleZoomEnabled = () => {
    this.setState({zoomEnabled: true});
    this.animValUpTiming.start();
    this.animCloseOpacityUpTiming.start();
  };

  handleZoomed = () => {
    this.setState({zoomed: true});
    this.animScrollOpacityDownTiming.start();
    this.animCloseOpacityDownTiming.start();
  };

  handleZoomClosePress = () => {
    if (this.state.zoomEnabled) {
      this.animScrollOpacityUpTiming.start();
      this.setState({zoomEnabled: false, zoomed: false});
      this.animValDownTiming.start();
      this.animCloseOpacityDownTiming.start();
    }
  };

  handleZoomExit = () => {
    if (this.state.zoomed) {
      this.setState({zoomed: false, zoomEnabled: true});
      this.animScrollOpacityUpTiming.start();
      this.animCloseOpacityUpTiming.start();
    }
  };

  renderZoomView = (image, i) => {
    return (
      <ZoomView
        key={i}
        source={image}
        zoomEnabled={this.state.zoomEnabled}
        zoomed={this.state.zoomed}
        onZoomEnabled={this.handleZoomEnabled}
        onZoomClosePress={this.handleZoomClosePress}
        onZoomExit={this.handleZoomExit}
        onZoomed={this.handleZoomed}
        translateY={this.animTranslateY}
        index={i}
        setModal={() => this.setState({modal: !this.state.modal})}
      />
    );
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginTop: 40,
        }}>
        <Animated.View
          style={{
            transform: [
              {
                translateY:
                  this.state.modal === false
                    ? this.animZoomVal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 220],
                      })
                    : this.animZoomVal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
              },
            ],
            height: 219,
            zIndex: 10,
          }}>
          <Animated.ScrollView
            grow
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={10}
            onScroll={Animated.event([
              {nativeEvent: {contentOffset: {x: this.animScrollXVal}}},
            ])}
            scrollEnabled={!this.state.zoomed}
            style={{
              overflow: 'visible',
            }}>
            {images.map((image, i) => {
              return this.renderZoomView(image, i);
            })}
          </Animated.ScrollView>
          <Animated.View
            style={{
              width: deviceWidth,
              height: 5,
            }}>
            <Animated.View
              style={{
                backgroundColor: '#E5E5E5',
                opacity: this.animScrollBarOpacityVal,
              }}>
              <Animated.View
                style={{
                  backgroundColor: '#111111',
                  width: deviceWidth / images.length,
                  height: 5,
                  transform: [
                    {
                      translateX: this.scrollXVal,
                    },
                  ],
                }}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}
