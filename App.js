import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Modal from 'react-native-modal';
import {
  gestureHandlerRootHOC,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const {height} = Dimensions.get('screen');

export default function App() {
  const pinchRef = useRef();
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
  const [image, setImage] = useState(imageArray[0]);
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);

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

  const PinchImage = gestureHandlerRootHOC(() => (
    <View style={styles.modalView}>
      <View style={{flex: 5, alignItems: 'center', justifyContent: 'center'}}>
        <PinchGestureHandler
          ref={pinchRef}
          minPointers={2}
          onGestureEvent={pinchGestureEvent}
          onHandlerStateChange={pinchStateChange}>
          <Animated.Image
            source={{uri: image}}
            style={{width: 300, height: 300, transform: [{scale: _scale}]}}
          />
        </PinchGestureHandler>
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Slider
          style={{width: 200, height: 40}}
          step={0.1}
          minimumValue={1}
          maximumValue={2}
          maximumTrackTintColor="#000000"
          thumbTintColor="red"
          onValueChange={index => {
            _baseScale.setValue(index);
          }}
        />
      </View>
    </View>
  ));

  return (
    <View style={styles.main}>
      <View style={{flex: 5, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity onPress={() => setModal(true)}>
          <Image source={{uri: image}} style={styles.image} />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Slider
          style={{width: 200, height: 40}}
          step={1}
          minimumValue={0}
          maximumValue={imageArray.length - 1}
          maximumTrackTintColor="#000000"
          thumbTintColor="red"
          onValueChange={index => {
            setImage(imageArray[index]);
            setIndex(index);
          }}
          value={index}
        />
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
    bottom: -height * 0.15,
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalView: {
    height: height * 0.77,
    backgroundColor: '#f2f2f2',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? height * 0.03 : 0,
  },
});
