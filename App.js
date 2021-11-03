import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  findNodeHandle,
  Dimensions,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import ImageSlider from 'react-native-image-slider';
import Modal from 'react-native-modal';
import {
  gestureHandlerRootHOC,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import PagerView from 'react-native-pager-view';

const {width, height} = Dimensions.get('screen');

export default function App() {
  const pinchRef = useRef();
  const zoomRef = useRef();
  const myScroll = useRef();
  const _baseScale = new Animated.Value(1);
  const _pinchScale = new Animated.Value(1);
  const _scale = Animated.multiply(_baseScale, _pinchScale);
  let _lastScale = 1;
  const imageArray = [
    'https://picsum.photos/200',
    'https://picsum.photos/id/237/200/300',
    'https://picsum.photos/seed/picsum/200/300',
    'https://picsum.photos/200/300?grayscale',
    'https://picsum.photos/200/300/?blur',
  ];

  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);
  const [image, setImage] = useState(imageArray[0]);

  const pinchGestureEvent = Animated.event(
    [{nativeEvent: {scale: _pinchScale}}],
    {useNativeDriver: true},
  );

  const pinchStateChange = event => {
    if (event.nativeEvent.oldState === 4) {
      _lastScale *= event.nativeEvent.scale;
      _baseScale.setValue(_lastScale);
      _pinchScale.setValue(1);
    }
  };

  const PinchImage = () => (
    <View style={styles.modalView}>
      <ScrollView
        horizontal
        ref={myScroll}
        initial={2}
        maximumZoomScale={1.6}
        minimumZoomScale={1.0}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={e => console.log(e._dispatchInstances.onTouchStart)}
        style={{overflow: 'hidden', height: 300}}>
        {imageArray.map((item, index) => {
          return (
            <Image
              source={{uri: item}}
              resizeMode={'contain'}
              style={{width: 390, height: 300}}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.main}>
      <View style={{flex: 1}}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 250,
          }}>
          <ImageSlider
            images={imageArray}
            position={index}
            onPositionChanged={index => {
              setIndex(index);
              setImage(imageArray[index]);
            }}
            customSlide={({index, item, style, width}) => (
              <TouchableOpacity
                onPress={() => {
                  setModal(true);
                  //myScroll.current.scrollTo({x: 100, y: 0});
                }}>
                <Image
                  source={{uri: item}}
                  resizeMode={'contain'}
                  style={{width: 390, height: 300}}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
      <Modal
        style={styles.modal}
        onBackdropPress={() => setModal(false)}
        isVisible={modal}>
        <PinchImage />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
  modal: {
    bottom: Platform.OS === 'ios' ? -height * 0.25 : -height * 0.15,
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalView: {
    height: height,
    backgroundColor: '#f2f2f2',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? height * 0.03 : 0,
    paddingTop: 100,
  },
  pagerView: {
    width: '100%',
    height: 100,
  },
});

/**
 * <ImageSlider
        images={imageArray}
        position={index}
        style={{width: '100%', backgroundColor: 'white'}}
        onPositionChanged={index => {
          setIndex(index);
        }}
        customSlide={({index, item, style, width}) => (
          <View
            key={index}
            style={{
              width: 390,
              height: 300,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <PinchGestureHandler
              ref={pinchRef}
              minPointers={2}
              onGestureEvent={pinchGestureEvent}
              onHandlerStateChange={pinchStateChange}>
              <Animated.Image
                source={{uri: imageArray[index]}}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 15,
                  transform: [{scale: _scale}],
                }}
              />
            </PinchGestureHandler>
          </View>
        )}
      />
 */

/**
  * <ScrollView horizontal>
            {imageArray.map((item, index) => {
              return (
                <TouchableOpacity onPress={() => setModal(true)}>
                  <Image
                    source={{uri: item}}
                    resizeMode={'contain'}
                    style={{width: 390, height: 300}}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
  */
