import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { Appbar, Button, Card, Headline } from "react-native-paper";
import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../../models/social.js";
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";
import { SafeAreaView } from "react-native-safe-area-context";


/* HOW TYPESCRIPT WORKS WITH PROPS:

  Remember the navigation-related props from Project 2? They were called `route` and `navigation`,
  and they were passed into our screen components by React Navigation automatically.  We accessed parameters 
  passed to screens through `route.params` , and navigated to screens using `navigation.navigate(...)` and 
  `navigation.goBack()`. In this project, we explicitly define the types of these props at the top of 
  each screen component.

  Now, whenever we type `navigation.`, our code editor will know exactly what we can do with that object, 
  and it'll suggest `.goBack()` as an option. It'll also tell us when we're trying to do something 
  that isn't supported by React Navigation! */

interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {
  // TODO: Initialize a list of SocialModel objects in state.
  const [socials, setSocials] = useState<SocialModel[]>([]);
  const [likes, setLikes] = useState<String[]>([]);
  const [changes, setChanges] = useState(true);
  const [icon, setIcon] = useState("heart-outline");
  const [inLikes, setInLikes] = useState(false);

  /* TYPESCRIPT HINT: 
    When we call useState(), we can define the type of the state
    variable using something like this:
        const [myList, setMyList] = useState<MyModelType[]>([]); */

  /*
    TODO: In a useEffect hook, start a Firebase observer to listen to the "socials" node in Firestore.
    Read More: https://firebase.google.com/docs/firestore/query-data/listen
  
    Reminders:
      1. Make sure you start a listener that's attached to this node!
      2. The onSnapshot method returns a method. Make sure to return the method
          in your useEffect, so that it's called and the listener is detached when
          this component is killed. 
          Read More: https://firebase.google.com/docs/firestore/query-data/listen#detach_a_listener
      3. You'll probably want to use the .orderBy method to order by a particular key.
      4. It's probably wise to make sure you can create new socials before trying to 
          load socials on this screen.
  */
  

  useEffect(() => {
    const db = firebase.firestore();
    const unsubscribe = db
      .collection("socials")
      .orderBy("eventDate", "asc")
      .onSnapshot((querySnapshot: any) => {
        var newSocials: SocialModel[] = [];
        querySnapshot.forEach((social: any) => {
          const newSocial = social.data() as SocialModel;
          newSocial.id = social.id;
          newSocials.push(newSocial);
        });
        setSocials(newSocials);
      });
    return unsubscribe;
  }, []);

  const toggleInterested = (social: SocialModel) => {
    if (icon === "heart") {
      setIcon("heart-outline");
    } else {
      setIcon("heart");
    }
    const ref = firebase.firestore().collection("socials").doc(social.id)

    if (changes && !inLikes) {
      const arr = likes;
      setLikes(arr)
      const res = ref.update({likes: likes}).then(() => {
        setChanges(false);
        setInLikes(true);

      })
    } else if (inLikes) {
      const arr = likes;
      setLikes(arr);
      const res = ref.update({likes: likes}).then(() => {
        setChanges(true);
        setInLikes(false);
      })
    }
  };

  const deleteSocial = (social: SocialModel) => {
    const documentRef = firebase.firestore().collection("socials").doc(social.id)
    var doc_data = documentRef.get();
    doc_data.then((data) => {
        const res = firebase.firestore().collection("socials").doc(social.id);
        res.delete().then(() => { 
        }).catch((err) => console.error(err));
    })
  };

  const Liked = (social: SocialModel) => {
    const documentRef = firebase.firestore().collection("socials").doc(social.id)
    var doc_data = documentRef.get();
    const likeValue = doc_data.then((data) => {
      var aaa= data.get("likes");
      setLikes(aaa);
    })

    return (
      <Button icon = {icon} onPress = {() => toggleInterested(social)}>{layks()}</Button>
    )
  }

  const layks = () => {
    if (!likes) {
      return 0
    } else {
      return likes.length;
    }
  } 

  const renderSocial = ({ item }: { item: SocialModel }) => {
    // TODO: Return a Card corresponding to the social object passed in
    // to this function. On tapping this card, navigate to DetailScreen
    // and pass this social.
    const onPress = () => {
      navigation.navigate("DetailScreen", {
        social: item,
      });
    };

    return (
      <Card onPress={onPress} style={{ margin: 16 }}>
	<Card.Cover source={{ uri: item.eventImage }} />
	<Card.Title
          title={item.eventName}
          subtitle={
            item.eventLocation +
            " • " +
            new Date(item.eventDate).toLocaleString()
          }
        /> 
        <Card.Actions>
          <Button onPress = {() => deleteSocial(item)}> Delete </Button>
          {Liked(item)}
        </Card.Actions>
      </Card>
    );
  };

  const NavigationBar = () => {
    // TODO: Return an AppBar, with a title & a Plus Action Item that goes to the NewSocialScreen.
    return null;
  };
  
  const noEvents = () => {
    return (
      <SafeAreaView>
        <Headline >No Events so far! Add some!!</Headline>
        </SafeAreaView>
    )
  }

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Content title="Socials" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate("NewSocialScreen");
          }}
        />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      {/* Embed your NavigationBar here. */}
      <View style={styles.container}>
        {/* Return a FlatList here. You'll need to use your renderItem method. */}
	<FlatList
	  data={socials}
	  renderItem={renderSocial}
	  keyExtractor={(_: any, index: number) => "key-" + index}
	  ListEmptyComponent={noEvents}
	/>
      </View>
    </>
  );
}
