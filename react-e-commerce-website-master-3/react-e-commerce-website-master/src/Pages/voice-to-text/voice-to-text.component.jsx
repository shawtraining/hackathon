import React, {useEffect, useRef, useState} from 'react';
import { firestore, convertCollectionsSnapshotToMap } from "../../firebase/firebase.utils";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { updateCollections } from "../../redux/shop/shop.actions";
import CollectionItem from '../../components/collection-item/collection-item.component'
import './voice-to-text.styles.css'
export default function VoiceToText() {
    const [message, setMessage] = useState('');

    const { transcript, resetTranscript } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const microphoneRef = useRef(null);

  useEffect(()=>{

    let unsubscribeFromSnapshot = null
    const categories = transcript.split(" ");
    console.log(categories);
    const collectionRef = firestore.collection('collections')
    unsubscribeFromSnapshot = collectionRef.onSnapshot(async snapshot => {
      const collectionMap = convertCollectionsSnapshotToMap(snapshot)
    //   console.log('collection map:',collectionMap[categories[0]])
    const menitems =[];
    collectionMap.mens.items.forEach(item => {
        menitems.push(item.name.toLowerCase());
    });
     ;
    console.log(menitems)
    const womenitems = [];
    collectionMap.womens.items.forEach(item => {
        womenitems.push(item.name.toLowerCase());
    });
    const jackets = [];
    collectionMap.jackets.items.forEach(item => {
        jackets.push(item.name.toLowerCase());
    });
    const hats = [];
    collectionMap.hats.items.forEach(item => {
        hats.push(item.name.toLowerCase());
    });

    if(menitems.includes(transcript.toLocaleLowerCase())){
        console.log('found it')
        let n = menitems.indexOf(transcript.toLocaleLowerCase());
        console.log(collectionMap.mens.items[n]);
        setMessage({items: [collectionMap.mens.items[n]]});
    }
    if(womenitems.includes(transcript.toLocaleLowerCase())){
        let n = womenitems.indexOf(transcript.toLocaleLowerCase());
        setMessage(collectionMap.womens.items[n])
    }
    if(jackets.includes(transcript.toLocaleLowerCase())){
        let n = jackets.indexOf(transcript.toLocaleLowerCase());
        setMessage(collectionMap.jackets.items[n])
    }
    if(hats.includes(transcript.toLocaleLowerCase())){
        let n = hats.indexOf(transcript.toLocaleLowerCase());
        setMessage(collectionMap.hats.items[n])
    }
    else{
        setMessage(collectionMap[transcript]);
    }
    
    //   setMessage(collectionMap[transcript])
      updateCollections(collectionMap)
      // setState({ loading: false })
  })


  },[transcript,isListening])
  console.log(message)
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="mircophone-container">
        Browser is not Support Speech Recognition.
      </div>
    );
  }
  const handleListing = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true,
    });
   
  };
  const categories = transcript.split(" ");
  console.log(categories);
  const stopHandle = () => {
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    SpeechRecognition.stopListening();

  };
  const handleReset = () => {
    stopHandle();
    resetTranscript();
  };
  return (
    <div className="microphone-wrapper">
      <div className="mircophone-container">
        <div
          className="microphone-icon-container"
          ref={microphoneRef}
          onClick={handleListing}
        >
          {/* <img src={microPhoneIcon} className="microphone-icon" /> */}
        </div>
        <div className="microphone-status">
          {isListening ? "Listening........." : "Click to start Listening"}
        </div>
        {isListening && (
          <button className="microphone-stop btn" onClick={stopHandle}>
            Stop
          </button>
        )}
      </div>
      {transcript && (
        <div className="microphone-result-container">
          <div className="microphone-result-text">{transcript}</div>
          <button className="microphone-reset btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
      {/* {transcript && message && (
        <div className="collection-page">
            <div className="items">
                {
                    message.items.map(item => <CollectionItem key={item.id} item={item} />)
                }
            </div>
        </div>
      )} */}
       {transcript &&  !isListening && message && (
        <div className="collection-page">
            <div className="items">
                { 
                    message.items.map(item => <CollectionItem key={item.id} item={item} />)
                }
            </div>
        </div>
      )}
    
    </div>
  );
    
}

