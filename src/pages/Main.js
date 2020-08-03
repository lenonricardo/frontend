import React, { useState, useEffect } from 'react'
import { StyleSheet, Image, Modal, View, Text, TextInput, TouchableOpacity, Dimensions, TouchableWithoutFeedback, Button } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons'
import Header from './header'
import dog from '../resources/dog.png'
import cat from '../resources/cat.png'
import user from '../resources/user.jpg'
import io from 'socket.io-client'

import api from '../services/api'

function Main({ navigation }) {

    const [posts, setPosts] = useState([])
    const [image, setImage] = useState([])
    const [title, setTitle] = useState([])
    const [desc, setDesc] = useState([])

    const [currentRegion, setCurrentRegion] = useState(null)

    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        async function loadInitialPosion() {
            const { granted } = await requestPermissionsAsync()

            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true
                })

                const { latitude, longitude } = coords

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                })
            }
        }

        loadInitialPosion()
    }, [])

    async function loadPosts() {
        const { latitude, longitude } = currentRegion

        const response = await api.get('/search', {
            params: {
                latitude,
                longitude
            }
        })

        setPosts(response.data.posts)
        //console.log(response.data.posts)
    }

    function handleRegionChanged(region) {
        setCurrentRegion(region)
        loadPosts()
    }


    if (!currentRegion) {
        return null
    }
    

    return (
        <>        
            <MapView onRegionChangeComplete={handleRegionChanged} initialRegion={currentRegion} style={styles.map}>
                {posts.map(post => (
                    <Marker
                        key={post._id}
                        coordinate={{
                            latitude: post.location.coordinates[1],
                            longitude: post.location.coordinates[0]
                        }} onPress={() => {
                            setModalVisible(true);
                            setImage(post.image)
                            setTitle(post.title)
                            setDesc(post.description)
                            // console.log(post.image)
                        }}>

                        {/* <Image style={styles.marcador} source={{ uri: 'https://cdn140.picsart.com/258332751021212.png' }} /> */}
                        <Image style={styles.marcador} source={dog} />

                        {/* <Callout onPress={() => {
                            //navegação
                            navigation.navigate('Profile', { userId: '123' })
                            console.log(post.image)
                        }}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutText}>
                                    <Image style={styles.dogImage} resizeMode="cover" source={{ uri: `http://192.168.100.21:3333/files/${post.image}` }} />
                                </Text>
                                <Text style={styles.dogName}>{post.title}</Text>
                                <Text style={styles.dogDesc}>{post.description}</Text>
                            </View>
                        </Callout> */}
                        <Modal
                            animationType="none"
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => {
                                setModalVisible(!modalVisible)
                            }}                     
                                                                           
                        >
                            <View style={styles.modalNew}>                    
                                <Image style={styles.dogImage} resizeMode="cover" source={{ uri: `http://192.168.100.21:3333/files/${image}` }} />
                            
                                <Text style={styles.dogName}>{title}</Text>
                                <Text style={styles.dogDesc}>{desc}</Text>
                                <Text style={styles.userName}>lenonricardo</Text>
                                <Text style={styles.userLocation}>Irati, PR</Text>
                                <Image style={styles.profileImage} resizeMode="cover" source={user} />
                                <TouchableOpacity style={styles.chatButton}>
                                <MaterialIcons onPress={() => console.log(post.image)} name="chat" size={20} color="#FFF" />   
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.loadButton}>
                                    <Text style={{color:"#fff", fontWeight: "bold", fontSize: 20}}>Fechar</Text>   
                                </TouchableOpacity>
                            </View>
                        </Modal>

                    </Marker>

                ))}

            </MapView>

            <Header navigation={navigation} />

            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Image
                        source={require('../resources/menu.png')}
                        style={styles.menuIcon}
                    />
                    <Image
                        source={require('../resources/log.png')}
                        style={styles.logo}
                    />
                </TouchableOpacity>
            </View> */}

            {/* <View style={styles.searchForm}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar animais por descrição"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.loadButton}>
                    <MaterialIcons name="my-location" size={20} color="#FFF" />
                </TouchableOpacity>
            </View> */}

            <TouchableOpacity onPress={() => {
                //navegação
                navigation.navigate('Postar', { currentRegion })
            }} style={styles.addButton}>
                <MaterialIcons name="pets" size={20} color="#FFF" />
            </TouchableOpacity>

        </>

    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    marcador: {
        width: 37,
        height: 37,
        //borderRadius: 4,
        //borderWidth: 4,
        //borderColor: '#fff' 
    },
    callout: {
        width: 190,
        height: 200
    },
    calloutText: {
        height: 100
    },
    dogName: {
        fontWeight: 'bold',
        fontSize: 16,
        bottom: -50,
        top: 10
    },
    dogDesc: {
        color: '#666',
        marginTop: 5,
        bottom: -50,
        top: 10
    },
    userName: {
        fontWeight: 'bold',
        color: '#63af92',
        fontSize: 16,
        bottom: -50,
        top: 315,
        left: 90,
        position: "absolute"
    },
    userLocation: {
        color: '#63af92',
        marginTop: 5,
        bottom: -50,
        top: 60,
        top: 328,
        left: 90,
        position: "absolute"
    },
    dogImage: {
        width: 190,
        height: 200,
        borderRadius: 50
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 100,
        position: "absolute",
        top: 300,
        left: 20
    },
    searchForm: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 2
    },

    loadButton: {
        width: 200,
        height: 50,
        backgroundColor: '#71C7A6',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        top: 200
        // marginLeft: 15

    },
    addButton: {
        width: 70,
        height: 70,
        backgroundColor: '#71C7A6',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
        position: 'absolute',
        bottom: 40,
        //left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
    },
     chatButton: {
        width: 50,
        height: 50,
        backgroundColor: '#71C7A6',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
        position: 'absolute',
        bottom: 40,
        //left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
        top: 305,
        left: 200
    },
    modalNew: {
        flex: 1,
        marginTop: 200,
        margin: 50,
        bottom: 100,
        padding: 22,
        borderRadius: 25,
        shadowRadius: 10,
        shadowColor: '#000',
        borderColor: '#ccc',
        backgroundColor: '#fff',
        alignContent: "center",
        alignItems: "center"
    },
    header: {
        flex: 1,
        height: 80,
        backgroundColor: '#71C7A6',
        color: '#fff',
        paddingHorizontal: 20,
        fontSize: 16,
        top: 0,
        position: 'absolute',
        flexDirection: 'row',
        width: Dimensions.get('window').width
    },
    menuIcon: {
        top: 40,
        width: 25,
        height: 25

    },

    logo: {
        left: 40,
        top: 8
    }
})

export default Main