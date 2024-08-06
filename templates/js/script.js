const accessToken = 'pk.eyJ1Ijoic3ViaGFtcHJlZXQiLCJhIjoiY2toY2IwejF1MDdodzJxbWRuZHAweDV6aiJ9.Ys8MP5kVTk5P9V2TDvnuDg';

        const baseMaps = {
            'Streets': L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
                attribution: '© Mapbox © OpenStreetMap',
                maxZoom: 18,
                tileSize: 512,
                zoomOffset: -1,
            }),
            'Satellite': L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
                attribution: '© Mapbox © OpenStreetMap',
                maxZoom: 18,
                tileSize: 512,
                zoomOffset: -1,
            }),
            'Dark': L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
                attribution: '© Mapbox © OpenStreetMap',
                maxZoom: 18,
                tileSize: 512,
                zoomOffset: -1,
            }),
            'Light': L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
                attribution: '© Mapbox © OpenStreetMap',
                maxZoom: 18,
                tileSize: 512,
                zoomOffset: -1,
            })
        };

        const map = L.map('map', {
            center: [51.505, -0.09],
            zoom: 13,
            layers: [baseMaps.Streets]
        });

        L.control.layers(baseMaps).addTo(map);

        let recognition;
        const transcriptElement = document.getElementById('transcript');
        const popup = document.getElementById('popup');
        const micButton = document.getElementById('mic-button');
        const closePopup = document.getElementById('close-popup');
        let currentMarker;

        micButton.onclick = function () {
            if (!recognition) {
                initializeRecognition();
            } else if (recognition && recognition.running) {
                recognition.stop();
            } else {
                recognition.start();
            }
        };

        closePopup.onclick = function () {
            recognition.stop();
            popup.style.display = 'none';
        };

        function initializeRecognition() {
            if ('webkitSpeechRecognition' in window) {
                recognition = new webkitSpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onstart = function () {
                    console.log('Voice recognition started.');
                    micButton.textContent = '🎤 Listening...';
                    popup.style.display = 'block';
                };

                recognition.onresult = function (event) {
                    const transcript = event.results[event.results.length - 1][0].transcript.trim();
                    console.log('You said: ', transcript);
                    transcriptElement.textContent = `Transcript: ${transcript}`;
                    // Ensure the transcript is shown before handling the command
                    setTimeout(() => handleVoiceCommand(transcript.toLowerCase()), 500);
                };

                recognition.onerror = function (event) {
                    console.error('Error occurred in recognition: ', event.error);
                };

                recognition.onend = function () {
                    micButton.textContent = '🎤 Start Voice Recognition';
                    popup.style.display = 'none';
                };
            } else {
                console.log('Web Speech API is not supported by this browser.');
                micButton.disabled = true;
            }
        }

        function handleVoiceCommand(command) {
            if (command.includes('zoom in')) {
                map.zoomIn();
                speakAndClosePopup('Zooming in.');
            } else if (command.includes('zoom out')) {
                map.zoomOut();
                speakAndClosePopup('Zooming out.');
            } else if (command.includes('go to')) {
                const location = command.replace('go to ', '');
                geocodeAndPanTo(location);
                speakAndClosePopup(`Navigating to ${location}.`);
            } else if (command.includes('add marker at')) {
                const location = command.replace('add marker at ', '');
                geocodeAndAddMarker(location);
                speakAndClosePopup(`Adding marker at ${location}.`);
            } else if (command.includes('show streets view')) {
                map.eachLayer((layer) => {
                    if (layer !== baseMaps.Streets) {
                        map.removeLayer(layer);
                    }
                });
                map.addLayer(baseMaps.Streets);
                speakAndClosePopup('Showing streets view.');
            } else if (command.includes('show satellite view')) {
                map.eachLayer((layer) => {
                    if (layer !== baseMaps.Satellite) {
                        map.removeLayer(layer);
                    }
                });
                map.addLayer(baseMaps.Satellite);
                speakAndClosePopup('Showing satellite view.');
            } else if (command.includes('show dark view')) {
                map.eachLayer((layer) => {
                    if (layer !== baseMaps.Dark) {
                        map.removeLayer(layer);
                    }
                });
                map.addLayer(baseMaps.Dark);
                speakAndClosePopup('Showing dark view.');
            } else if (command.includes('show light view')) {
                map.eachLayer((layer) => {
                    if (layer !== baseMaps.Light) {
                        map.removeLayer(layer);
                    }
                });
                map.addLayer(baseMaps.Light);
                speakAndClosePopup('Showing light view.');
            } else {
                speakAndClosePopup('Command not recognized. Please try again.');
            }
        }

        function geocodeAndPanTo(location) {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${accessToken}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features.length > 0) {
                        const [lng, lat] = data.features[0].center;
                        map.setView([lat, lng], 13);
                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }
                        currentMarker = L.marker([lat, lng]).addTo(map).bindPopup(location).openPopup();
                        speakAndClosePopup(`Navigated to ${location}.`);
                    } else {
                        speakAndClosePopup('Location not found.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    speakAndClosePopup('An error occurred while finding the location.');
                });
        }

        function geocodeAndAddMarker(location) {
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${accessToken}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features.length > 0) {
                        const [lng, lat] = data.features[0].center;
                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }
                        currentMarker = L.marker([lat, lng]).addTo(map);
                        map.setView([lat, lng], 13);
                        currentMarker.bindPopup(location).openPopup();
                        speakAndClosePopup(`Added marker at ${location}.`);
                    } else {
                        speakAndClosePopup('Location not found.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    speakAndClosePopup('An error occurred while finding the location.');
                });
        }

        function speakAndClosePopup(text) {
            speak(text);
            if (recognition) {
                recognition.stop();
            }
            popup.style.display = 'none';
            transcriptElement.textContent = 'Transcript: ';
        }

        function speak(text) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                speechSynthesis.speak(utterance);
            } else {
                console.log('Speech Synthesis API is not supported by this browser.');
            }
        }

        // Speak a welcome message once the page is loaded
        window.onload = function () {
            speak('Welcome to the voice-enabled map application.');
        }