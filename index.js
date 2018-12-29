import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Platform,
  Animated,
  Text,
  View,
  Dimensions,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import Swiper from "react-native-swiper";

import Colors from "../../constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 44 : 20) : 0;
const NAV_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 88 : 64) : 82;

const SCROLL_EVENT_THROTTLE = 16;
const DEFAULT_HEADER_MAX_HEIGHT = 200;
const DEFAULT_HEADER_MIN_HEIGHT = NAV_BAR_HEIGHT;
const DEFAULT_EXTRA_SCROLL_HEIGHT = 50;
const DEFAULT_BACKGROUND_IMAGE_SCALE = 1.5;

const DEFAULT_NAVBAR_COLOR = "#3498db";
const DEFAULT_BACKGROUND_COLOR = "#303F9F";
const DEFAULT_TITLE_COLOR = "white";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DEFAULT_NAVBAR_COLOR,
    overflow: "hidden"
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: DEFAULT_HEADER_MAX_HEIGHT,
    resizeMode: "cover"
  },
  bar: {
    backgroundColor: "transparent",
    height: DEFAULT_HEADER_MIN_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0
  },
  headerTitle: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: STATUS_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle2: {
    marginLeft: 8,
    width: 120,
    height: 26
  },

  headerText: {
    color: DEFAULT_TITLE_COLOR,
    textAlign: "center",
    fontSize: 16
  },

  loading: {
    height: 256,
    backgroundColor: Colors.tintColor,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0.01,
    //marginTop, -1,
    // bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  }
});

class RNParallax extends Component {
  constructor() {
    super();
    this.state = {
      scrollY: new Animated.Value(0),
      timePassed: false
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setTimePassed();
    }, 1000);
  }

  setTimePassed() {
    this.setState({ timePassed: true });
  }

  getHeaderMaxHeight() {
    const { headerMaxHeight } = this.props;
    return headerMaxHeight;
  }

  getHeaderMinHeight() {
    const { headerMinHeight } = this.props;
    return headerMinHeight;
  }

  getHeaderScrollDistance() {
    return this.getHeaderMaxHeight() - this.getHeaderMinHeight();
  }

  getExtraScrollHeight() {
    const { extraScrollHeight } = this.props;
    return extraScrollHeight;
  }

  getBackgroundImageScale() {
    const { backgroundImageScale } = this.props;
    return backgroundImageScale;
  }

  getInputRange() {
    return [-this.getExtraScrollHeight(), 0, this.getHeaderScrollDistance()];
  }

  getHeaderHeight() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [
        this.getHeaderMaxHeight() + this.getExtraScrollHeight(),
        this.getHeaderMaxHeight(),
        this.getHeaderMinHeight()
      ],
      extrapolate: "clamp"
    });
  }

  getNavBarOpacity() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [0, 1, 1],
      extrapolate: "clamp"
    });
  }

  getImageOpacity() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [1, 1, 0],
      extrapolate: "clamp"
    });
  }

  getImageTranslate() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [0, 0, -50],
      extrapolate: "clamp"
    });
  }

  getImageScale() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [this.getBackgroundImageScale(), 1, 1],
      extrapolate: "clamp"
    });
  }

  getTitleTranslate() {
    return this.state.scrollY.interpolate({
      inputRange: this.getInputRange(),
      outputRange: [5, 0, 0],
      extrapolate: "clamp"
    });
  }

  renderHeaderTitle() {
    const { title, titleStyle } = this.props;
    const titleTranslate = this.getTitleTranslate();

    return (
      <Animated.View
        style={[
          styles.headerTitle,
          {
            transform: [{ translateY: titleTranslate }],
            height: this.getHeaderHeight()
          }
        ]}
      >
        <Text style={[styles.headerText, titleStyle]}>{title}</Text>
      </Animated.View>
    );
  }

  renderHeaderForeground() {
    const { renderNavBar } = this.props;

    return (
      <Animated.View
        style={[
          styles.bar,
          {
            height: this.getHeaderMinHeight()
          }
        ]}
      >
        {renderNavBar()}
      </Animated.View>
    );
  }

  handleImageLoaded() {
    this.setTimePassed();
  }

  renderBackgroundImage() {
    const { backgroundImage } = this.props;
    const imageOpacity = this.getImageOpacity();
    const imageTranslate = this.getImageTranslate();
    const imageScale = this.getImageScale();

    return (
      <Swiper
        autoplay={false}
        autoplayTimeout={4}
        nextButton={<Text style={styles.buttonText}>›</Text>}
        prevButton={<Text style={styles.buttonText}>‹</Text>}
        //autoplay={this.state.autoplay}
        loop={false}
        autoplayDirection={true}
        activeDotColor={"#fff"}
        style={{ height: this.getHeaderMaxHeight() }}
        showsButtons
      >
        {backgroundImage.map((item, key) => (
          <Animated.Image
            key={key}
            style={[
              styles.backgroundImage,
              {
                height: this.getHeaderMaxHeight(),
                opacity: imageOpacity,
                transform: [
                  { translateY: imageTranslate },
                  { scale: imageScale }
                ]
              }
            ]}
            defaultSource={require("../../assets/images/no-record-found.jpg")}
            // onLoad={this.handleImageLoaded.bind(this)}

            source={{ uri: item }}
          />
        ))}
      </Swiper>

      // <Animated.Image
      //   style={[
      //     styles.backgroundImage,
      //     {
      //       height: this.getHeaderMaxHeight(),
      //       opacity: imageOpacity,
      //       transform: [{ translateY: imageTranslate }, { scale: imageScale }]
      //     }
      //   ]}
      //   defaultSource={require("../../assets/images/no-record-found.jpg")}
      //   onLoad={this.handleImageLoaded.bind(this)}
      //   source={backgroundImage}
      // />
    );
  }

  renderPlainBackground() {
    const { backgroundColor } = this.props;

    const imageOpacity = this.getImageOpacity();
    const imageTranslate = this.getImageTranslate();
    const imageScale = this.getImageScale();

    return (
      <Animated.View
        style={{
          height: this.getHeaderMaxHeight(),
          backgroundColor,
          opacity: imageOpacity,
          transform: [{ translateY: imageTranslate }, { scale: imageScale }]
        }}
      />
    );
  }

  renderNavbarBackground() {
    const { navbarColor } = this.props;
    const { title, titleStyle } = this.props;
    const navBarOpacity = this.getNavBarOpacity();

    if (!this.state.timePassed) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color="#FFF" size="large" />
        </View>
      );
    } else {
      return (
        <Animated.View
          style={[
            styles.header,
            {
              height: this.getHeaderHeight(),
              backgroundColor: navbarColor,
              opacity: navBarOpacity
            }
          ]}
        >
          <View
            style={{
              // justifyContent: "center",
              alignItems: "center",
              marginTop: NAV_BAR_HEIGHT - 38
            }}
          >
            <ImageBackground
              resizeMode="cover"
              style={styles.headerTitle2}
              source={require("../../assets/images/bg-number-plate.png")}
            >
              <Text
                style={{
                  color: "#000",
                  alignSelf: "center",
                  justifyContent: "center",
                  marginTop: 1.8,
                  marginLeft: 7,
                  fontFamily: "Kenteken",
                  fontSize: 18
                }}
              >
                {title}
              </Text>
            </ImageBackground>
          </View>
        </Animated.View>
      );
    }
  }

  renderHeaderBackground() {
    const { backgroundImage, backgroundColor } = this.props;
    const imageOpacity = this.getImageOpacity();

    return (
      <Animated.View
        style={[
          styles.header,
          {
            height: this.getHeaderHeight(),
            opacity: imageOpacity,
            backgroundColor: backgroundImage ? "transparent" : backgroundColor
          }
        ]}
      >
        {backgroundImage && this.renderBackgroundImage()}
        {!backgroundImage && this.renderPlainBackground()}
      </Animated.View>
    );
  }

  renderScrollView() {
    const {
      renderContent,
      scrollEventThrottle,
      contentContainerStyle,
      containerStyle
    } = this.props;

    return (
      <Animated.ScrollView
        style={styles.scrollView}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
        ])}
        contentContainerStyle={contentContainerStyle}
      >
        <View
          style={[{ marginTop: this.getHeaderMaxHeight() }, containerStyle]}
        >
          {renderContent()}
        </View>
      </Animated.ScrollView>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderScrollView()}
        {this.renderNavbarBackground()}
        {this.renderHeaderBackground()}
        {/* {this.renderHeaderTitle()} */}
        {this.renderHeaderForeground()}
      </View>
    );
  }
}

RNParallax.propTypes = {
  renderNavBar: PropTypes.func,
  renderContent: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string,
  backgroundImage: PropTypes.any,
  navbarColor: PropTypes.string,
  title: PropTypes.string,
  titleStyle: PropTypes.any,
  headerMaxHeight: PropTypes.number,
  headerMinHeight: PropTypes.number,
  scrollEventThrottle: PropTypes.number,
  extraScrollHeight: PropTypes.number,
  backgroundImageScale: PropTypes.number,
  contentContainerStyle: PropTypes.any,
  containerStyle: PropTypes.any
};

RNParallax.defaultProps = {
  renderNavBar: () => <View />,
  navbarColor: DEFAULT_NAVBAR_COLOR,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  backgroundImage: null,
  title: "",
  titleStyle: styles.headerText,
  headerMaxHeight: DEFAULT_HEADER_MAX_HEIGHT,
  headerMinHeight: DEFAULT_HEADER_MIN_HEIGHT,
  scrollEventThrottle: SCROLL_EVENT_THROTTLE,
  extraScrollHeight: DEFAULT_EXTRA_SCROLL_HEIGHT,
  backgroundImageScale: DEFAULT_BACKGROUND_IMAGE_SCALE,
  contentContainerStyle: null,
  containerStyle: null
};

export default RNParallax;
