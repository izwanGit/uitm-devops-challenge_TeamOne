import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { Geolocation } from '@capacitor/geolocation'
import { getApiBaseUrl } from '@/utils/apiConfig'

const useMobileCapabilities = () => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return

        const initCapabilities = async () => {
            try {
                // 1. Request Push Notification Permissions
                const pushPermStatus = await PushNotifications.checkPermissions()

                let pushGranted = pushPermStatus.receive === 'granted'
                if (pushPermStatus.receive === 'prompt') {
                    const newStatus = await PushNotifications.requestPermissions()
                    pushGranted = newStatus.receive === 'granted'
                }

                if (pushGranted) {
                    // Add listeners first
                    PushNotifications.addListener('registration', (token) => {
                        console.log('Push registration success, token: ' + token.value)
                        registerDeviceToken(token.value)
                    })

                    PushNotifications.addListener('registrationError', (error: any) => {
                        console.warn('Push registration failed (expected if no real Firebase):', error)
                        // Fallback: Generate a mock token for development/security testing
                        const mockToken = 'mock_device_token_' + Math.random().toString(36).substring(7)
                        console.log('Using mock token:', mockToken)
                        registerDeviceToken(mockToken)
                    })

                    PushNotifications.addListener('pushNotificationReceived', (notification) => {
                        console.log('Push received: ' + JSON.stringify(notification))
                    })

                    // Attempt registration
                    await PushNotifications.register()
                }

                // 2. Request Location Permissions and Get Position
                const locPermStatus = await Geolocation.checkPermissions()

                let locGranted = locPermStatus.location === 'granted'
                if (locPermStatus.location === 'prompt') {
                    const newStatus = await Geolocation.requestPermissions()
                    locGranted = newStatus.location === 'granted'
                }

                if (locGranted) {
                    try {
                        // Added timeout (20s) and disabled high accuracy for better emulator reliability
                        const coordinates = await Geolocation.getCurrentPosition({
                            timeout: 20000,
                            enableHighAccuracy: false
                        })
                        console.log('Current position:', coordinates)
                        // Send location to backend for Security Middleware (GeoIP/Velocity check)
                        updateDeviceLocation(coordinates.coords.latitude, coordinates.coords.longitude)
                    } catch (locErr) {
                        console.warn('Location retrieval failed silently (mocked/emulator environment):', locErr)
                    }
                }

            } catch (error) {
                console.error('Error initializing mobile capabilities:', error)
            }
        }

        initCapabilities()

        // Cleanup listeners not strictly required as they are global, but good practice if manageable
        // For simple app lifecycle we leave them active

        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners()
            }
        }
    }, [])
}

// Helper to send token to backend
const registerDeviceToken = async (token: string) => {
    try {
        const tokenStr = localStorage.getItem('authToken')
        if (!tokenStr) return

        const API_URL = getApiBaseUrl()
        await fetch(`${API_URL}/api/security/device/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenStr}`
            },
            body: JSON.stringify({ pushToken: token, platform: 'android' })
        })
    } catch (e) {
        console.error('Failed to register device token', e)
    }
}

// Helper to send location to backend
const updateDeviceLocation = async (lat: number, lng: number) => {
    try {
        const tokenStr = localStorage.getItem('authToken')
        if (!tokenStr) return

        const API_URL = getApiBaseUrl()
        await fetch(`${API_URL}/api/security/device/location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenStr}`
            },
            body: JSON.stringify({ latitude: lat, longitude: lng })
        })
    } catch (e) {
        console.error('Failed to update device location', e)
    }
}

export default useMobileCapabilities
