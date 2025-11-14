//@ts-nocheck
import { Component, default as React } from "react";
import { Dimensions, StyleSheet, TextInput, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textInput: {
    marginVertical: 12,
    marginHorizontal: 24,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    color: "#15141F",
    height: Dimensions.get("window").width * 0.09,
    width: Dimensions.get("window").width * 0.09,
  },
});

const getOTPTextChucks = (
  inputCount: number,
  inputCellLength: number,
  text: string
) => {
  let otpText =
    text?.match(new RegExp(".{1," + inputCellLength + "}", "g")) || [];

  otpText = otpText.slice(0, inputCount);

  return otpText;
};

class OTPTextView extends Component {
  constructor(props: any) {
    super(props);

    this.state = {
      focusedInput: 0,
      otpText: getOTPTextChucks(
        props.inputCount,
        props.inputCellLength,
        props.defaultValue
      ),
    };

    this.inputs = [];
  }

  basicValidation = (text: string) => {
    const validText = /^[0-9a-zA-Z]+$/;
    return text?.match(validText);
  };

  onTextChange = (text: string, i: number) => {
    const { inputCellLength, inputCount, handleTextChange } = this.props;

    if (text && !this.basicValidation(text)) {
      return;
    }

    this.setState(
      (prevState) => {
        let { otpText } = prevState;

        otpText[i] = text;
        return {
          otpText,
        };
      },
      () => {
        handleTextChange(this.state.otpText.join(""));
        if (text.length === inputCellLength && i !== inputCount - 1) {
          this.inputs[i + 1].focus();
        }
      }
    );
  };

  onInputFocus = (i) => {
    const { otpText } = this.state;

    const prevIndex = i - 1;

    if (prevIndex > -1 && !otpText[prevIndex] && !otpText.join("")) {
      this.inputs[prevIndex].focus();

      return;
    }

    this.setState({ focusedInput: i });
  };

  onKeyPress = (e, i) => {
    if (e.nativeEvent.key === "Backspace" && i !== 0) {
      let { otpText } = this.state;
      if (otpText[i]) {
        this.inputs[i].clear();
        return;
      }
      this.inputs[i - 1].focus();
    }
  };

  clear = () => {
    this.setState(
      {
        otpText: [],
      },
      () => {
        this.inputs[0].focus();
        this.props.handleTextChange("");
      }
    );
  };

  setValue = (value) => {
    const { inputCount, inputCellLength } = this.props;

    const updatedFocusInput = value.length - 1;

    this.setState(
      {
        otpText: getOTPTextChucks(inputCount, inputCellLength, value),
      },
      () => {
        if (this.inputs[updatedFocusInput]) {
          this.inputs[updatedFocusInput].focus();
        }

        this.props.handleTextChange(value);
      }
    );
  };

  render() {
    const {
      inputCount,
      offTintColor,
      tintColor,
      defaultValue,
      inputCellLength,
      containerStyle,
      textInputStyle,
      keyboardType,
      autoCapitalize,
      autoFocus,
      disabled,
      ...textInputProps
    } = this.props;

    const { focusedInput, otpText } = this.state;

    const TextInputs = [];

    for (let i = 0; i < inputCount; i += 1) {
      const inputStyle = [
        styles.textInput,
        textInputStyle,
        { backgroundColor: otpText[i] ? tintColor : offTintColor },
      ];

      if (focusedInput === i) {
        inputStyle.push({ backgroundColor: offTintColor });
      }

      TextInputs.push(
        <TextInput
          returnKeyType="done"
          ref={(e) => {
            this.inputs[i] = e;
          }}
          key={i}
          autoCorrect={false}
          keyboardType={keyboardType || "numeric"}
          autoFocus={autoFocus}
          value={otpText[i] || ""}
          style={inputStyle}
          selectTextOnFocus
          autoCapitalize={autoCapitalize as any}
          onFocus={() => this.onInputFocus(i)}
          selectionColor={"#A0A4A8"}
          onChangeText={(text) => {
            if (
              text.charAt(text.length - 1) ==
              otpText[i]?.charAt(otpText[i]?.length - 1)
            ) {
              this.onTextChange(text.charAt(0), i);
            } else {
              this.onTextChange(text.charAt(text.length - 1), i);
            }
          }}
          multiline={false}
          editable={!disabled}
          onKeyPress={(e) => this.onKeyPress(e, i)}
          {...textInputProps}
        />
      );
    }

    return <View style={[styles.container, containerStyle]}>{TextInputs}</View>;
  }
}

export default OTPTextView;
