import React, { useState, useEffect } from "react";
import { Platform, View, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImage, setEventImage] = useState<string | undefined>(undefined);
  // Date picker.
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [visible, setVisible] = useState(false);
  // Snackbar.
  const [message, setMessage] = useState("");
  // Loading state for submit button
  const [loading, setLoading] = useState(false);


  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/
  // Code for ImagePicker (from docs)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log("done");
    if (!result.cancelled) {
      setEventImage(result.uri);
    }
  };

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    date.setSeconds(0);
    setEventDate(date);
    hideDatePicker();
  };

  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html
  const onDismissSnackBar = () => setVisible(false);
  const showError = (error: string) => {
    setMessage(error);
    setVisible(true);
  };

  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.

    if (!eventName) {
      showError("Please enter an event name.");
      return;
    } else if (!eventDate) {
      showError("Please choose an event date.");
      return;
    } else if (!eventLocation) {
      showError("Please enter an event location.");
      return;
    } else if (!eventDescription) {
      showError("Please enter an event description.");
      return;
    } else if (!eventImage) {
      showError("Please choose an event image.");
      return;
    } else {
      setLoading(true);
    }

    try {

      // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
      // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!

      // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
      // saved in our eventImage state variable to a Blob.

      // (1) Write the image to Firebase Cloud Storage. Make sure to do this
      // using an "await" keyword, since we're in an async function. Name it using
      // the uuid provided below.

      // (2) Get the download URL of the file we just wrote. We're going to put that
      // download URL into Firestore (where our data itself is stored). Make sure to
      // do this using an async keyword.

      // (3) Construct & write the social model to the "socials" collection in Firestore.
      // The eventImage should be the downloadURL that we got from (3).
      // Make sure to do this using an async keyword.
      
      // (4) If nothing threw an error, then go back to the previous screen.
      //     Otherwise, show an error.

      // Firestore wants a File Object, so we first convert the file path
      // saved in eventImage to a file object.
      const object: Blob = (await getFileObjectAsync(eventImage)) as Blob;
      // Generate a brand new doc ID by calling .doc() on the socials node.
      const socialRef = firebase.firestore().collection("socials").doc();
      const result = await firebase
        .storage()
        .ref()
        .child(socialRef.id + ".jpg")
        .put(object);
      const downloadURL = await result.ref.getDownloadURL();
      // TODO: You may want to update this SocialModel's default
      // fields by adding one or two attributes to help you with
      // interested/likes & deletes
      const doc: SocialModel = {
        eventName: eventName,
        eventDate: eventDate.getTime(),
        eventLocation: eventLocation,
        eventDescription: eventDescription,
        eventImage: downloadURL,
        likes: []
      };
      await socialRef.set(doc);
      setLoading(false);
      navigation.goBack();      

    } catch (error) {
      setLoading(false);
      showError(error.toString());
    }
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        {/* TextInput */}
        {/* TextInput */}
        {/* TextInput */}
        {/* Button */}
        {/* Button */}
        {/* Button */}
        {/* DateTimePickerModal */}
        {/* Snackbar */}
	<Button onPress={() => Keyboard.dismiss()} > Dismiss Keyboard</Button>
        <TextInput
          label="Event Name"
          value={eventName}
          onChangeText={(name: any) => setEventName(name)}
          style={{ backgroundColor: "white", marginBottom: 10 }}
        />
        <TextInput
          label="Event Location"
          value={eventLocation}
          onChangeText={(location: any) => setEventLocation(location)}
          style={{ backgroundColor: "white", marginBottom: 10 }}
        />
        <TextInput
          label="Event Description"
          value={eventDescription}
          multiline={true}
          onChangeText={(desc: any) => setEventDescription(desc)}
          style={{ backgroundColor: "white", marginBottom: 10 }}
        />
        <Button
          mode="outlined"
          onPress={showDatePicker}
          style={{ marginTop: 20 }}
        >
          {eventDate ? eventDate.toLocaleString() : "Choose a Date"}
        </Button>

        <Button mode="outlined" onPress={pickImage} style={{ marginTop: 20 }}>
          {eventImage ? "Change Image" : "Pick an Image"}
        </Button>
        <Button
          mode="contained"
          onPress={saveEvent}
          style={{ marginTop: 20 }}
          loading={loading}
        >
          Save Event
        </Button>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <Snackbar
          duration={3000}
          visible={visible}
          onDismiss={onDismissSnackBar}
        >
          {message}
        </Snackbar>
      </View>
    </>
  );
}
