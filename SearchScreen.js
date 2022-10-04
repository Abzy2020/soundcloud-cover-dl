import React, {useEffect, useState} from 'react';

import {
  Text,
  SafeAreaView,
  View,
  TextInput,
  Linking,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Button,
} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';


const OpenURLButton = ({ link, url }) => {
  const openLink = async () => {
    await Linking.openURL(link);
  }

  return (
    <TouchableOpacity
      onPress={openLink}
    >
      <Image
        style={styles.songImg}
        source={{
          width: 352,
          height: 352,
          uri: url,
        }}
      />
    </TouchableOpacity>
  );
};

const SongSearch = ({ navigation }) => {
  const [words, setWords] = useState('Tell em');
  const [text, setText] = useState(words);
  const [title, setTitle] = useState('Tell em');
  const [imgLink, setImgLink] = useState('');
  const [url, setUrl] = useState(
    'https://i1.sndcdn.com/artworks-XuS8WowEPhsl-0-t500x500.jpg',
  );

  const getData = async () => {
    const headersList = {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      Authorization: 'OAuth 2-290059-196302119-NmwlWO42a2Glyb',
      Connection: 'keep-alive',
      Host: 'api-v2.soundcloud.com',
      Origin: 'https://soundcloud.com',
      Referer: 'https://soundcloud.com/',
      'sec-ch-ua':
        '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': 'Windows',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    };

    try {
      const res = await fetch(
        `https://api-v2.soundcloud.com/search?q=${text}&variant_ids=2531&facet=model&user_id=634653-375092-227591-658765&client_id=RfoqFLXghO6UuFNArI1Ksd17qWClDBFt&limit=20&offset=0&linked_partitioning=1&app_version=1660231961&app_locale=en`,
        headersList,
      );
      const json = await res.json();
      const tempImg = await json.collection[0].artwork_url;
      const songTitle = await json.collection[0].title;
      const artist = await json.collection[0].publisher_metadata.artist;
      const link = await json.collection[0].permalink_url
  
      const secTempImg = tempImg.slice(0, -9);
      const songImg = `${secTempImg}t500x500.jpg`;
  
      setUrl(prevUrl => (prevUrl = songImg));
      setTitle(prevTitle => (prevTitle = `${songTitle} by ${artist}`));
      setImgLink(prevImgLink => (prevImgLink = link));
      
    } catch (error) {
      console.log(error);
    }
  };

  const checkPermissions = async() => {
    if(Platform.OS === 'ios'){
      downloadImg();
    } else{
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: "App needs access to storage"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED){
          downloadImg()
        } else{
          alert('Storage permission needed');
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  const downloadImg = () => {
    let date = new Date();
    let ext = getExtension(url);
    ext = '.' + ext[0];

    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: PictureDir + '/artcloud_' +
         Math.floor(date.getDate() + date.getSeconds()/2) + ext,
        description: 'Image',
      }
    }
    config(options)
    .fetch('GET', url)
    .then(res => {
      console.log('res -> ', JSON.stringify(res))
      alert('Image download successful')
    })
  };

  const getExtension = (file) => {
    return /[.]/.exec(file) ? /[^.]+$/.exec(file) : undefined;
  };

  const makeRequest = async () => {
    setText(words);
    await getData();
  }

  useEffect( () => {
    getData();
  }, [text]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fc6a1c"/>
      <View style={styles.song}>
        <OpenURLButton link={imgLink} url={url} />
        <Text style={styles.text}>{title}</Text>
      </View>
      <TextInput
        style={styles.input}
        onChangeText={newWords => setWords(newWords)}
        placeholder="Tell em"
        keyboardType="default"
      />
      <TouchableOpacity 
        style={styles.btn}
        onPress={makeRequest}
        >
        <View>
          <Text style={styles.btnText}>Search</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn}>
      <View
        onPress={checkPermissions}
      >
        <Text style={styles.btnText}>Download</Text>
      </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#fff',
    padding: 10,
  },
  input: {
    height: 40,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: '#fc6203',
    color: '#999',
  },
  text: {
    color: '#fc6203',
    fontSize: 16,
    justifyContent: 'center',
    alignContent: 'center',
    padding: 10,
  },
  btn: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fc6a1c",
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  song: {
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  songImg: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    borderRadius: 10,
  }
});

export default SongSearch;
