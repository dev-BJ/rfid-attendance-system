'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wifi, Settings as SettingsIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// WebBLE Service and Characteristic UUIDs (these should match your hardware)
const WIFI_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
const WIFI_SSID_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a6"
const WIFI_PASSWORD_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a7"
const WIFI_STORE_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"
const WIFI_STATUS_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export default function SettingsPage() {
  const [wifiConfig, setWifiConfig] = useState({
    ssid: '',
    password: '',
  });
  const [showWifiForm, setShowWifiForm] = useState(false);
  const [webbleConnected, setWebbleConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [device, setDevice] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [wifiStatus, setWifiStatus] = useState<string | null>(null)

  const isBleSupported = typeof navigator !== "undefined" && "bluetooth" in navigator

  const connectDevice = useCallback(async () => {
    if (!isBleSupported) {
      setMessage("Web Bluetooth is not supported in this browser")
      setStatus("error")
      return
    }

    try {
      setStatus("connecting")
      setMessage("Scanning for devices...")

      const selectedDevice = await (navigator as any)?.bluetooth.requestDevice({
        acceptAllDevices: true,
        // filters: [{ services: [WIFI_SERVICE_UUID] }],
        optionalServices: [WIFI_SERVICE_UUID],
      })

      selectedDevice.addEventListener("gattserverdisconnected", () => {
        setStatus("disconnected")
        setDevice(null)
        setMessage("Device disconnected")
        setWebbleConnected(false)
        setWifiConfig({ ssid: '', password: '' });
        setShowWifiForm(false);
      })

      setMessage("Connecting to device...")
      const server = await selectedDevice.gatt?.connect()

      if (!server) {
        throw new Error("Failed to connect to GATT server")
      }

      setDevice(selectedDevice)
      setStatus("connected")
      setWebbleConnected(true)
      setMessage(`Connected to ${selectedDevice.name || "Unknown Device"}`)

      // Try to read current WiFi status
      try {
        const service = await server.getPrimaryService(WIFI_SERVICE_UUID)

        const ssidChar = await service.getCharacteristic(WIFI_SSID_CHAR_UUID)
        const ssidValue = await ssidChar.readValue()
        const currentSsid = new TextDecoder().decode(ssidValue)
        // console.log("Current SSID:", currentSsid)
        // setWifiConfig({...wifiConfig, ssid: currentSsid})

        const passwordChar = await service.getCharacteristic(WIFI_PASSWORD_CHAR_UUID)
        const passwordValue = await passwordChar.readValue()
        const currentPassword = new TextDecoder().decode(passwordValue)
        // console.log("Current Password:", currentPassword)
        setWifiConfig({ssid: currentSsid, password: currentPassword})
        // console.log(wifiConfig)
      } catch {
        // Status characteristic might not exist
      }
    } catch (error) {
      if (error instanceof Error && error.name === "NotFoundError") {
        setMessage("No compatible device found")
      } else {
        setMessage(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
      setStatus("error")
    }
  }, [isBleSupported])

  const disconnectDevice = useCallback(async () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect()
    }
    setDevice(null)
    setStatus("disconnected")
    setMessage("")
    // setWifiStatus(null)
    setWebbleConnected(false)
    setWifiConfig({ ssid: '', password: '' });
    setShowWifiForm(false);

  }, [device])

  const sendCredentials = useCallback(async () => {
    if (!device?.gatt?.connected) {
      setMessage("Device not connected")
      setWebbleConnected(false)
      return
    }

    if (!wifiConfig.ssid.trim()) {
      setMessage("Please enter a WiFi SSID")
      return
    }

    // setIsSubmitting(true)
    setMessage("Sending credentials...")

    try {
      const server = device.gatt
      const service = await server.getPrimaryService(WIFI_SERVICE_UUID)

      // Send SSID
      const ssidChar = await service.getCharacteristic(WIFI_SSID_CHAR_UUID)
      const ssidData = new TextEncoder().encode(wifiConfig.ssid)
      await ssidChar.writeValue(ssidData)

      // Send Password
      const passwordChar = await service.getCharacteristic(WIFI_PASSWORD_CHAR_UUID)
      const passwordData = new TextEncoder().encode(wifiConfig.password)
      await passwordChar.writeValue(passwordData)

      // Send Store Command
      const storeChar = await service.getCharacteristic(WIFI_STORE_CHAR_UUID)
      await storeChar.writeValue(new Uint8Array([1])) // Command to store credentials

      setMessage("WiFi credentials sent successfully!")

      // Wait and check status
      setTimeout(async () => {
        try {
          const statusChar = await service.getCharacteristic(WIFI_STATUS_CHAR_UUID)
          const value = await statusChar.readValue()
          const statusText = new TextDecoder().decode(value)
          console.log("WiFi Status:", statusText)
          setWifiStatus(statusText)
        } catch {
          // Ignore status read errors
        }
      }, 3000)
    } catch (error) {
      setMessage(`Failed to send credentials: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      // setIsSubmitting(false)
      setWifiConfig({ ssid: '', password: '' });
      setShowWifiForm(false);
    }
  }, [device, wifiConfig])

  // const handleWifiSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!wifiConfig.ssid || !wifiConfig.password) {
  //     alert('Please fill in all fields');
  //     return;
  //   }
  //   alert('WiFi configuration sent to device (simulation)');
  //   setWifiConfig({ ssid: '', password: '' });
  //   setShowWifiForm(false);
  // };

  // const handleBleScan = async () => {
  //   try {
  //     setWebbleConnected(true);
  //     alert('BLE device scanned successfully (simulation)');
  //     setTimeout(() => setWebbleConnected(false), 3000);
  //   } catch (error) {
  //     alert('Failed to scan BLE device');
  //   }
  // };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure system and device settings</p>
      </div>

      {/* WebBLE Configuration */}
      <Card className="p-6 bg-card border-border mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary" />
          WebBLE Device Configuration
        </h2>
        <p className="text-muted-foreground mb-4">
          Connect to RFID devices via Bluetooth and configure WiFi settings
        </p>

        {!isBleSupported && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Browser Not Supported</AlertTitle>
              <AlertDescription>
                Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera on desktop.
              </AlertDescription>
            </Alert>
          )}

        {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              {status === "connected" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status === "connecting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-foreground">Device Connection Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {webbleConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  webbleConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`}
              />
            </div>
          </div>

          {
            webbleConnected ? (
              <Button
                onClick={disconnectDevice}
                variant="outline"
                className="w-full border-red-500 text-red-500 hover:bg-red-50"
              >
                {'Disconnect Device'}
              </Button>
            ) : (

              <Button
                onClick={connectDevice}
                disabled={webbleConnected}
                className="w-full bg-primary hover:bg-primary/90"
              >
              {'Scan for BLE Devices'}
            </Button>
            )
          }
        </div>
      </Card>

      {/* WiFi Configuration */}
      <Card className="p-6 bg-card border-border mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-accent" />
          WiFi Configuration
        </h2>
        <p className="text-muted-foreground mb-4">
          Configure WiFi credentials for RFID devices (requires BLE connection)
        </p>

        {!showWifiForm ? (
          <Button
            onClick={() => setShowWifiForm(true)}
            disabled={!webbleConnected}
            className="bg-primary hover:bg-primary/90"
          >
            Configure WiFi
          </Button>
        ) : (
          <form onSubmit={e => {e.preventDefault(); sendCredentials();}} className="space-y-4">
            <div className="p-4 bg-background/50 border border-border rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Device must be connected via BLE to configure WiFi settings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                WiFi Network Name (SSID)
              </label>
              <Input
                type="text"
                placeholder="e.g., MyNetwork"
                value={wifiConfig.ssid}
                onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                WiFi Password
              </label>
              <Input
                type="text"
                placeholder="Enter WiFi password"
                value={wifiConfig.password}
                onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Send Configuration
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowWifiForm(false);
                  setWifiConfig({ ssid: '', password: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* System Information */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          System Information
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">System Version</span>
            <span className="font-mono text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">API Version</span>
            <span className="font-mono text-foreground">v1</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Database Status</span>
            <span className="text-green-400 font-medium">Connected</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-mono text-foreground">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
